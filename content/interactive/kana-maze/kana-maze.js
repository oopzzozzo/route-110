// kana-maze: steer the ball by singing japanese vowels
// directions follow flick input: tap=a left=i up=u right=e down=o

// ---- config ----
var WIDTH = 900;
var HEIGHT = 600;
var CELL = 50;
var GRID = 12;
var MAZE_W = CELL * GRID;
var HUD_X = MAZE_W;
var BALL_R = 12;

// dsp
var FFT_SIZE = 2048;
var N_MEL = 20;
var MEL_LO = 120;
var MEL_HI = 4000;
var N_CEP = 13;
var CEP_USE = 8;
var PROB_TAU = 0.08;
var LOUD_TAU = 0.06;
var GATE_DB = 12;
var GATE_REL_DB = 6;
var FLAT_MAX = 0.30;
var FLOOR_FAST = 0.25;
var FLOOR_SLOW = 0.0005;
var FLOOR_WARM = 60;
var LOUD_RANGE_DB = 20;
var DB_FLOOR = -140;

// game
var VOWELS = ['a', 'i', 'u', 'e', 'o'];
var KANA = {a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お'};
// flick input puts both confusion pairs (u/o, i/e) on opposite axes, so a
// confused read cancels to weak thrust instead of pointing somewhere wrong.
// don't rearrange without re-reading the plan.
var DIRS = {u: [0, -1], e: [1, 0], o: [0, 1], i: [-1, 0]};
var BEAR = {u: 0, e: 90, o: 180, i: 270};
var THRUST = 500;
var MAXV = 260;
var DAMP_BASE = 0.6;
var DAMP_A = 8.0;
var RESTITUTION = 0.35;
var WALL_FRIC = 0.6;       // per second, same as the floor -- NOT per impact
var GOAL_R = 16;
var WIN_SPEED = 80;
var DT = 1 / 120;

// f1/f2/f3 for the synth harness, male, hz
var SYNTH_GAIN = 0.02;
var REF_F0 = 120;          // reference tone pitch
var REF_GAIN = 0.20;      // ~-17 dBFS; 0.03 was inaudible
var REF_DUR = 1.2;         // seconds of canonical vowel played back
var REF_GAP = 0.35;        // silence before capture arms, so it can't bleed in
var PROBE_GAIN = 0.05;     // reference injected into the analyser, inaudible
var PROBE_STEP = 0.34;     // seconds per vowel while priming templates
var BLEND_TEMP = 0.10;
var FORMANTS = {a: [775, 1200, 2600], i: [280, 2300, 3000], u: [330, 1300, 2200],
                e: [480, 1900, 2550], o: [500, 850, 2500]};

var TUNE_HOLD_S = 1.2;
var TUNE_TIMEOUT = 8;
var LIVE_MEAN_TAU = 20;    // long, so one held vowel can't become the mean
var LIVE_MEAN_MIN = 120;   // voiced frames before the channel mean is trusted
var GOOD_PX = 21;          // inside the target ring counts as a match
var CAL_HOLD_S = 1.2;
var CAL_TIMEOUT_S = 8;
var CAL_TRIM_HEAD = 15;
var CAL_TRIM_TAIL = 10;
var CAL_STABLE_MIN = 0.90;
var CAL_LOUD_MIN = 15;
var CAL_DUP_MAX = 0.98;

var MAZES = [[
  "############",
  "#S.........#",
  "#..........#",
  "#.......####",
  "#.......####",
  "####.......#",
  "####.......#",
  "#.......####",
  "#.......####",
  "#..........#",
  "#.........G#",
  "############"
], [
  "############",
  "#S.........#",
  "#########..#",
  "#########..#",
  "#..........#",
  "#..#########",
  "#..#########",
  "#..........#",
  "#########..#",
  "#########..#",
  "#########.G#",
  "############"
], [
  "############",
  "#S.#.......#",
  "#..#.####..#",
  "#..#.#..#..#",
  "#....#..#..#",
  "#.####..#..#",
  "#.#...#.#..#",
  "#.#.#.#.#..#",
  "#...#...#..#",
  "#####.####.#",
  "#.........G#",
  "############"
]];

// ---- state ----
var canvas, ctx;
var state = 'menu';          // menu calintro calhold caldone play won
var lastTs = 0, accum = 0, fps = 0;

// audio
var audioCtx, analyser, micStream, micSource, muteGain;
var freqDb, freqByte, timeBuf, binHz, hasFloatFreq = true;
var melBanks, dctTable, melLog, cepRaw;
var refVoice, probeVoice, refTmpl = null, refUntil = 0, calArmAt = 0;
var primeIdx = 0, primeT = 0, primeAcc = null, primeN = 0;
var micLevel = -90, noiseFloor = -60, floorWarm = 0, flatness = 1;
var voiced = false, loud = 0, micError = '';

// recognition
var temp = 0.25;
var userTmpl = null, tmplMean = null, refMean = null;
var liveMean = null, liveMeanN = 0, scratchA = null, scratchB = null;
var tuneIdx = 0, tuneRec = false, tuneFrames = [], tuneVoiced = 0, tuneT0 = 0, tryTmpl = {};
var probs = {a: 0, i: 0, u: 0, e: 0, o: 0};
var rawProbs = {a: 0, i: 0, u: 0, e: 0, o: 0};
var probLock = false;

// calibration

// synth harness
var synthMode = '', synthOsc, synthFilters, synthGain, synthAt = 0, synthCur = 'a';

// game
var lvlIdx = 0, grid = [], goal = [0, 0], startCell = [0, 0];
var ball = {x: 0, y: 0, vx: 0, vy: 0}, touchNx = 0, touchNy = 0;
var keys = {}, hudMode = 0, startedAt = 0, elapsed = 0, buttons = [], skipped = false;

// ---- helpers ----
clamp = (v, lo, hi) => v < lo ? lo : (v > hi ? hi : v);
hz2mel = f => 2595 * Math.log10(1 + f / 700);
mel2hz = m => 700 * (Math.pow(10, m / 2595) - 1);
fmt = (n, d) => n.toFixed(d);

cosSim = function(a, b, lo, hi) {
  var d = 0, na = 0, nb = 0;
  for (var i = lo; i < hi; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na <= 0 || nb <= 0) return 0;
  return d / Math.sqrt(na * nb);
}

// ---- setup ----
window.onload = function() {
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = WIDTH;
  ctx.canvas.height = HEIGHT;
  synthMode = (location.search.match(/[?&]synth=([a-z0-9]+)/) || ['', ''])[1];
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', updateButtons);
  canvas.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && audioCtx) audioCtx.resume();
  });
  loadMaze(0);
  menu();
  window.requestAnimationFrame(gameLoop);
};

menu = function() {
  state = 'menu';
  clearButtons();
  registerButton({f: startClicked, icon: 'next', l: 252, t: 440, w: 96, h: 56, hover: false});
};

startClicked = function() {
  clearButtons();
  canvas.focus();
  initAudio();
  openMic();
};

initAudio = function() {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { micError = 'no web audio — arrow keys only'; return; }
  audioCtx = new AC();
  audioCtx.resume();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = 0;   // we smooth in the probability domain
  hasFloatFreq = typeof analyser.getFloatFrequencyData === 'function';
  freqDb = new Float32Array(analyser.frequencyBinCount);
  freqByte = new Uint8Array(analyser.frequencyBinCount);
  timeBuf = new Float32Array(analyser.fftSize);
  binHz = audioCtx.sampleRate / FFT_SIZE;
  muteGain = audioCtx.createGain();
  muteGain.gain.value = 0;
  analyser.connect(muteGain);
  muteGain.connect(audioCtx.destination);
  buildMelBanks();
  buildDctTable();
  melLog = new Float32Array(N_MEL);
  cepRaw = new Float32Array(N_CEP);
  liveMean = new Float32Array(N_CEP);
  tmplMean = new Float32Array(N_CEP);
  refMean = new Float32Array(N_CEP);
  scratchA = new Float32Array(N_CEP);
  scratchB = new Float32Array(N_CEP);
};

openMic = function() {
  if (!audioCtx) { state = 'play'; loadMaze(0); return; }
  if (synthMode) { startSynth(); afterAudio(); return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    micError = 'no microphone api — arrow keys only';
    state = 'play'; loadMaze(0); return;
  }
  // all three must be off: agc fades a held note, denoise mangles the envelope
  state = 'micreq';
  navigator.mediaDevices.getUserMedia({audio: {
    autoGainControl: false, noiseSuppression: false, echoCancellation: false
  }}).then(function(s) {
    micStream = s;                       // ios collects these if unreferenced
    micSource = audioCtx.createMediaStreamSource(s);
    micSource.connect(analyser);
    afterAudio();
  }).catch(function() {
    micError = 'microphone denied — arrow keys only';
    state = 'play'; loadMaze(0);
  });
};

afterAudio = function() {
  if (skipped) return;
  primeBegin();
};

// ---- synth harness: a formant-filtered saw, so the dsp is testable with no mic ----
// a cascade formant synth: sawtooth glottal source through three resonances
makeVoice = function(dest) {
  var osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = REF_F0;
  var node = osc, filters = [], i, f;
  for (i = 0; i < 3; i++) {
    f = audioCtx.createBiquadFilter();
    f.type = 'peaking'; f.Q.value = 8; f.gain.value = 18;
    node.connect(f); node = f;
    filters.push(f);
  }
  var g = audioCtx.createGain();
  g.gain.value = 0;
  node.connect(g); g.connect(dest);
  osc.start();
  return {osc: osc, filters: filters, gain: g};
};

voiceSet = function(filters, v) {
  for (var i = 0; i < 3; i++) filters[i].frequency.value = FORMANTS[v][i];
};

// the canonical a/i/u/e/o, so you don't have to guess what to aim at
playReference = function(v) {
  if (!audioCtx || !FORMANTS[v] || synthMode) return;
  if (!refVoice) refVoice = makeVoice(audioCtx.destination);
  voiceSet(refVoice.filters, v);
  var t = audioCtx.currentTime, g = refVoice.gain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(0, t);
  g.linearRampToValueAtTime(REF_GAIN, t + 0.05);
  g.setValueAtTime(REF_GAIN, t + REF_DUR - 0.1);
  g.linearRampToValueAtTime(0, t + REF_DUR);
  refUntil = performance.now() + REF_DUR * 1000;
};

refStop = function() {
  if (!refVoice) return;
  var t = audioCtx.currentTime, g = refVoice.gain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0, t + 0.04);
  refUntil = 0;
};

startSynth = function() {
  var v = makeVoice(analyser);
  synthOsc = v.osc; synthFilters = v.filters; synthGain = v.gain;
  synthCur = synthMode.length > 1 ? synthMode[0] : 'a';
  voiceSet(synthFilters, synthCur);
};

setSynthVowel = function(v) {
  if (!synthFilters) return;
  if (!v || !FORMANTS[v]) { synthGain.gain.value = 0; return; }
  synthCur = v;
  voiceSet(synthFilters, v);
  synthGain.gain.value = SYNTH_GAIN;
};

updateSynth = function(dt) {
  if (!synthFilters || synthMode.length < 2) return;
  synthAt += dt;
  if (synthAt > 1.1 && synthGain.gain.value > 0) setSynthVowel(null);
  if (synthAt < 1.5) return;
  synthAt = 0;
  setSynthVowel(synthMode[(synthMode.indexOf(synthCur) + 1) % synthMode.length]);
};

// ---- maze and physics ----
loadMaze = function(idx) {
  lvlIdx = idx;
  var src = MAZES[idx], r, c, ch;
  grid = [];
  for (r = 0; r < GRID; r++) {
    grid[r] = [];
    for (c = 0; c < GRID; c++) {
      ch = src[r][c];
      grid[r][c] = ch === '#' ? 1 : 0;
      if (ch === 'S') startCell = [c, r];
      if (ch === 'G') goal = [c, r];
    }
  }
  resetBall();
  startedAt = 0;
  elapsed = 0;
};

resetBall = function() {
  ball.x = startCell[0] * CELL + CELL / 2;
  ball.y = startCell[1] * CELL + CELL / 2;
  ball.vx = 0; ball.vy = 0;
};

accelVec = function() {
  var ax = 0, ay = 0;
  for (var k in DIRS) { ax += probs[k] * DIRS[k][0]; ay += probs[k] * DIRS[k][1]; }
  return [ax, ay];
};

applyAccel = function(dt) {
  var a = accelVec();
  ball.vx += a[0] * THRUST * loud * dt;
  ball.vy += a[1] * THRUST * loud * dt;
  // exponential: frame-rate independent, never overshoots through zero
  var d = Math.exp(-(DAMP_BASE + DAMP_A * probs.a * loud) * dt);
  ball.vx *= d; ball.vy *= d;
};

stepPhysics = function(dt) {
  applyAccel(dt);
  var sp = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (sp > MAXV) { ball.vx *= MAXV / sp; ball.vy *= MAXV / sp; }
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  touchNx = 0; touchNy = 0;
  resolveCollisions();
  resolveCollisions();   // second pass settles inside corners
  wallFriction(dt);
  checkWin();
};

resolveCollisions = function() {
  var c0 = clamp(((ball.x - BALL_R) / CELL) | 0, 0, GRID - 1);
  var c1 = clamp(((ball.x + BALL_R) / CELL) | 0, 0, GRID - 1);
  var r0 = clamp(((ball.y - BALL_R) / CELL) | 0, 0, GRID - 1);
  var r1 = clamp(((ball.y + BALL_R) / CELL) | 0, 0, GRID - 1);
  for (var r = r0; r <= r1; r++) {
    for (var c = c0; c <= c1; c++) {
      if (!grid[r][c]) continue;
      var nx = clamp(ball.x, c * CELL, c * CELL + CELL);
      var ny = clamp(ball.y, r * CELL, r * CELL + CELL);
      var dx = ball.x - nx, dy = ball.y - ny;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d >= BALL_R) continue;
      if (d < 1e-6) { dx = 0; dy = -1; d = 1; }
      var ux = dx / d, uy = dy / d;
      ball.x = nx + ux * BALL_R;
      ball.y = ny + uy * BALL_R;
      touchNx += ux; touchNy += uy;
      var vn = ball.vx * ux + ball.vy * uy;
      if (vn >= 0) continue;
      ball.vx -= (1 + RESTITUTION) * vn * ux;
      ball.vy -= (1 + RESTITUTION) * vn * uy;
    }
  }
};

// scaling tangential speed per collision instead of per second made this
// depend on the substep rate: 0.9 per impact at 120 hz is 0.9^120 a second,
// which pinned the ball to any wall it grazed
wallFriction = function(dt) {
  var n = Math.hypot(touchNx, touchNy);
  if (n < 1e-6) return;
  var ux = touchNx / n, uy = touchNy / n;
  var vn = ball.vx * ux + ball.vy * uy;
  var k = Math.exp(-WALL_FRIC * dt);
  ball.vx = (ball.vx - vn * ux) * k + vn * ux;
  ball.vy = (ball.vy - vn * uy) * k + vn * uy;
};

checkWin = function() {
  if (state !== 'play') return;
  var gx = goal[0] * CELL + CELL / 2, gy = goal[1] * CELL + CELL / 2;
  var d = Math.hypot(ball.x - gx, ball.y - gy);
  var sp = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (d < GOAL_R && sp < WIN_SPEED) {
    state = 'won';
    clearButtons();
    registerButton({f: nextLevel, icon: 'next', l: 252, t: 400, w: 96, h: 56, hover: false});
  }
};

nextLevel = function() {
  loadMaze((lvlIdx + 1) % MAZES.length);
  state = 'play';
  playButtons();
};

// ---- dsp ----
buildMelBanks = function() {
  var lo = hz2mel(MEL_LO), hi = hz2mel(MEL_HI), edge = [], i, k, b;
  for (i = 0; i < N_MEL + 2; i++)
    edge.push(mel2hz(lo + (hi - lo) * i / (N_MEL + 1)) / binHz);   // in bins
  melBanks = [];
  for (k = 0; k < N_MEL; k++) {
    var b0 = Math.ceil(edge[k]), b1 = edge[k + 1], b2 = Math.floor(edge[k + 2]);
    var w = [];
    for (b = b0; b <= b2; b++)
      w.push(b < b1 ? (b - edge[k]) / (b1 - edge[k])
                    : (edge[k + 2] - b) / (edge[k + 2] - b1));
    melBanks.push({start: b0, w: w});
  }
};

buildDctTable = function() {
  dctTable = [];
  for (var n = 0; n < N_CEP; n++) {
    dctTable[n] = new Float32Array(N_MEL);
    for (var k = 0; k < N_MEL; k++)
      dctTable[n][k] = Math.cos(Math.PI * n * (k + 0.5) / N_MEL);
  }
};

// power spectrum -> mel sum -> log -> dct. summing dB instead would be a mean
// of logs, which the quiet bins between harmonics dominate.
computeMfcc = function() {
  var k, j, n, e, s, db;
  for (k = 0; k < N_MEL; k++) {
    var bank = melBanks[k];
    e = 0;
    for (j = 0; j < bank.w.length; j++) {
      db = freqDb[bank.start + j];
      if (!(db > DB_FLOOR)) db = DB_FLOOR;   // also catches -Infinity and NaN
      e += bank.w[j] * Math.pow(10, db / 10);
    }
    melLog[k] = Math.log(e + 1e-10);
  }
  for (n = 0; n < N_CEP; n++) {
    s = 0;
    for (k = 0; k < N_MEL; k++) s += melLog[k] * dctTable[n][k];
    cepRaw[n] = s;
  }
};


spectralFlatness = function() {
  var b0 = Math.max(1, Math.round(MEL_LO / binHz));
  var b1 = Math.min(freqDb.length - 1, Math.round(MEL_HI / binHz));
  var sumLog = 0, sumLin = 0, n = 0, db;
  for (var b = b0; b <= b1; b++) {
    db = freqDb[b];
    if (!(db > DB_FLOOR)) db = DB_FLOOR;
    sumLog += db; sumLin += Math.pow(10, db / 10); n++;
  }
  if (!n) return 1;
  return Math.pow(10, (sumLog / n) / 10) / (sumLin / n + 1e-30);
};

readAudio = function(dt) {
  if (!analyser) return;
  analyser.getFloatTimeDomainData(timeBuf);
  var s = 0, i;
  for (i = 0; i < timeBuf.length; i++) s += timeBuf[i] * timeBuf[i];
  micLevel = 20 * Math.log10(Math.sqrt(s / timeBuf.length) + 1e-9);
  if (floorWarm < FLOOR_WARM) {
    noiseFloor = floorWarm ? Math.min(noiseFloor, micLevel) : micLevel;
    floorWarm++;
  }
  else noiseFloor += (micLevel - noiseFloor) * (micLevel < noiseFloor ? FLOOR_FAST : FLOOR_SLOW);

  if (hasFloatFreq) analyser.getFloatFrequencyData(freqDb);
  else {
    analyser.getByteFrequencyData(freqByte);
    var lo = analyser.minDecibels, hi = analyser.maxDecibels;
    for (i = 0; i < freqByte.length; i++) freqDb[i] = lo + freqByte[i] / 255 * (hi - lo);
  }
  flatness = spectralFlatness();

  // hysteresis is the only anti-chatter mechanism: there is no hold-over
  var thresh = voiced ? noiseFloor + GATE_REL_DB : noiseFloor + GATE_DB;
  voiced = micLevel > thresh && flatness < FLAT_MAX;
  if (voiced) {
    var target = clamp((micLevel - noiseFloor - GATE_DB) / LOUD_RANGE_DB, 0, 1);
    loud += (target - loud) * (1 - Math.exp(-dt / LOUD_TAU));
    computeMfcc();
    updateLiveMean(dt);
  } else {
    loud = 0;                            // hard cut, bypassing the attack ema
  }
};

classify = function(dt) {
  var set = activeTmpl();
  if (!set || !voiced) {
    for (var z in rawProbs) rawProbs[z] = 0;
  } else {
    var on = liveMeanN >= LIVE_MEAN_MIN;
    var q = meanSub(scratchA, cepRaw, liveMean, on);
    var sims = {}, m = -1e9, v;
    for (v in set) {
      sims[v] = cosSim(q, meanSub(scratchB, set[v], tmplMean, on), 1, CEP_USE + 1);
      if (sims[v] > m) m = sims[v];
    }
    var sum = 0, ex = {};
    for (v in sims) { ex[v] = Math.exp((sims[v] - m) / temp); sum += ex[v]; }
    for (v in ex) rawProbs[v] = ex[v] / sum;
  }
  var a = 1 - Math.exp(-dt / PROB_TAU);
  for (var k in probs) probs[k] += (rawProbs[k] - probs[k]) * a;
};

// ---- input ----
onKeyDown = function(ev) {
  if (state === 'play' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(ev.key))
    ev.preventDefault();
  keys[ev.key] = true;
  if (ev.key === 'd') hudMode = (hudMode + 1) % 3;
  if (ev.key === 'r' && analyser) { skipped = false; micError = ''; tuneOpen(); }
  if (ev.key === 'R') { clearUser(); }
  if (ev.key === 'l' && state === 'tune') tunePlayCur();
  if (ev.key === '[') temp = clamp(temp * 0.85, 0.03, 1);
  if (ev.key === ']') temp = clamp(temp / 0.85, 0.03, 1);
  if (ev.key === 'Escape' && state === 'tune') { tuneClose(); return; }
  if (ev.key === 'Escape' && (state === 'micreq' || state.slice(0, 3) === 'cal')) {
    skipped = true;
    if (!micError) micError = 'skipped — arrow keys only';
    state = 'play'; loadMaze(lvlIdx);
  }
  if (synthFilters && '12345'.includes(ev.key)) setSynthVowel(VOWELS[+ev.key - 1]);
};

onKeyUp = function(ev) { keys[ev.key] = false; };

onClick = function(ev) {
  canvas.focus();
  updateButtons(ev);
  for (var i = buttons.length - 1; i >= 0; i--)
    if (buttons[i].hover) { buttons[i].f(); return; }
};

// keys write into probs rather than bypassing them, so the blend arithmetic,
// the hud and the physics are all exercised by the keyboard path
keyProbs = function() {
  var held = [];
  if (keys.ArrowUp) held.push('u');
  if (keys.ArrowRight) held.push('e');
  if (keys.ArrowDown) held.push('o');
  if (keys.ArrowLeft) held.push('i');
  if (keys[' ']) held.push('a');
  if (!held.length) return false;
  for (var v in probs) probs[v] = 0;
  for (var i = 0; i < held.length; i++) probs[held[i]] = 1 / held.length;
  loud = 1;
  return true;
};

// ---- calibration ----
// capture each canonical vowel's mfcc in the recognizer's own feature space,
// by injecting the formant synth straight into the analyser (silent)
primeBegin = function() {
  if (!probeVoice) probeVoice = makeVoice(analyser);
  state = 'calprime';
  primeIdx = 0; primeT = 0; primeN = 0;
  primeAcc = new Float32Array(N_CEP);
  refTmpl = {};
  voiceSet(probeVoice.filters, VOWELS[0]);
  probeVoice.gain.gain.value = 0;        // held until the noise floor settles
};

primeStep = function(dt) {
  // if the probe sounded before the floor warmed up, the floor would latch
  // onto it and the gate would never open again
  if (floorWarm < FLOOR_WARM) return;
  if (!probeVoice.gain.gain.value) { probeVoice.gain.gain.value = PROBE_GAIN; primeT = 0; return; }
  primeT += dt;
  if (primeT > 0.16 && primeT < PROBE_STEP - 0.04 && voiced) {
    for (var n = 0; n < N_CEP; n++) primeAcc[n] += cepRaw[n];
    primeN++;
  }
  if (primeT < PROBE_STEP) return;
  if (primeN) {
    var t = new Float32Array(N_CEP);
    for (var k = 0; k < N_CEP; k++) t[k] = primeAcc[k] / primeN;
    refTmpl[VOWELS[primeIdx]] = t;
  }
  primeIdx++; primeT = 0; primeN = 0; primeAcc = new Float32Array(N_CEP);
  if (primeIdx >= VOWELS.length) {
    probeVoice.gain.gain.value = 0;
    if (Object.keys(refTmpl).length < VOWELS.length) refTmpl = null;   // no guessing
    loadUser();
    setMeans();
    state = 'play'; loadMaze(0); playButtons();
    return;
  }
  voiceSet(probeVoice.filters, VOWELS[primeIdx]);
};

// where a sound sits on the vowel chart: similarity to the five reference
// templates, used as weights over their canonical positions. no formant
// tracking, and it lives in the same space the recognizer scores in.
activeTmpl = function() { return userTmpl || refTmpl; };

meanOf = function(set, out) {
  var n = 0, v, i;
  for (i = 0; i < N_CEP; i++) out[i] = 0;
  for (v in set) { for (i = 0; i < N_CEP; i++) out[i] += set[v][i]; n++; }
  if (n) for (i = 0; i < N_CEP; i++) out[i] /= n;
  return out;
};

setMeans = function() {
  if (refTmpl) meanOf(refTmpl, refMean);
  if (activeTmpl()) meanOf(activeTmpl(), tmplMean);
};

// the reference templates come from a synth wired straight into the analyser;
// the player arrives through a microphone. a fixed channel colouring is a
// fixed offset in the cepstral domain, so subtracting each side's own mean
// cancels it. the window is long because one held vowel must not become
// the mean and subtract itself away.
updateLiveMean = function(dt) {
  var w = 1 - Math.exp(-dt / LIVE_MEAN_TAU), i;
  for (i = 0; i < N_CEP; i++) liveMean[i] += (cepRaw[i] - liveMean[i]) * w;
  liveMeanN++;
};

meanSub = function(dst, src, m, on) {
  for (var i = 0; i < N_CEP; i++) dst[i] = on ? src[i] - m[i] : src[i];
  return dst;
};

blendPos = function(vec) {
  if (!refTmpl || !vec) return null;
  var sims = {}, m = -1e9, v, sum = 0, ex = {}, x = 0, y = 0;
  var on = liveMeanN >= LIVE_MEAN_MIN;
  var q = meanSub(scratchA, vec, liveMean, on);
  for (v in refTmpl) {
    sims[v] = cosSim(q, meanSub(scratchB, refTmpl[v], refMean, on), 1, CEP_USE + 1);
    if (sims[v] > m) m = sims[v];
  }
  for (v in sims) { ex[v] = Math.exp((sims[v] - m) / BLEND_TEMP); sum += ex[v]; }
  for (v in ex) {
    var p = vsPos(FORMANTS[v][0], FORMANTS[v][1]);
    x += p[0] * ex[v] / sum; y += p[1] * ex[v] / sum;
  }
  return [x, y];
};

// ---- tuning: practise against the canonical sound, commit only on request ----
tuneCount = function() { var n = 0; for (var v in tryTmpl) n++; return n; };

tuneScore = function(v) {                 // px from the canonical target
  if (!tryTmpl[v]) return null;
  var got = blendPos(tryTmpl[v]);
  if (!got) return null;
  var t = vsPos(FORMANTS[v][0], FORMANTS[v][1]);
  return Math.hypot(got[0] - t[0], got[1] - t[1]);
};

tuneOpen = function() {
  if (!analyser) return;
  if (!refTmpl) { primeBegin(); return; }
  state = 'tune';
  tuneIdx = 0; tuneRec = false;
  tuneButtons();
};

tuneButtons = function() {
  clearButtons();
  var y = 452, b = function(f, ic, l, w) {
    registerButton({f: f, icon: ic, l: l, t: y, w: w, h: 50, hover: false});
  };
  b(function() { tuneMove(-1); }, 'prev', 127, 50);
  b(tunePlayCur,                  'play', 191, 70);
  b(tuneRecord,                   'rec',  275, 70);
  b(function() { tuneMove(1); },  'next', 359, 50);
  b(tuneClose,                    'back', 423, 50);
  if (tuneCount() === VOWELS.length)
    registerButton({f: tuneCommit, icon: 'check', l: 260, t: 516, w: 80, h: 40, hover: false});
};

tuneMove = function(d) {
  refStop();
  tuneIdx = (tuneIdx + d + VOWELS.length) % VOWELS.length;
  tuneRec = false;
  tuneButtons();
};

tunePlayCur = function() { tuneRec = false; playReference(VOWELS[tuneIdx]); };

tuneRecord = function() {
  if (tuneRec) { tuneRec = false; return; }       // press again to cancel
  refStop();
  tuneRec = true; tuneFrames = []; tuneVoiced = 0; tuneT0 = performance.now();
};

tuneStep = function(dt) {
  if (!tuneRec) return;
  if (voiced) { tuneFrames.push(Float32Array.from(cepRaw)); tuneVoiced += dt; }
  if (tuneVoiced >= TUNE_HOLD_S && tuneFrames.length > CAL_TRIM_HEAD + CAL_TRIM_TAIL + 10) {
    var kept = tuneFrames.slice(CAL_TRIM_HEAD, tuneFrames.length - CAL_TRIM_TAIL);
    var mean = new Float32Array(N_CEP), i, n;
    for (i = 0; i < kept.length; i++)
      for (n = 0; n < N_CEP; n++) mean[n] += kept[i][n] / kept.length;
    tryTmpl[VOWELS[tuneIdx]] = mean;
    tuneRec = false;
    tuneButtons();
  } else if (performance.now() - tuneT0 > TUNE_TIMEOUT * 1000) {
    tuneRec = false;
  }
};

// nothing is adopted unless this is pressed: by default the tuning screen
// only shows you where you land, so a learner moves toward the canonical
// sound instead of the game moving toward them
tuneCommit = function() {
  if (tuneCount() < VOWELS.length) return;
  userTmpl = {};
  for (var v in tryTmpl) userTmpl[v] = Float32Array.from(tryTmpl[v]);
  setMeans();
  saveUser();
  tuneClose();
};

tuneClose = function() {
  state = 'play';
  loadMaze(lvlIdx);          // fresh attempt; the clock shouldn't run while tuning
  playButtons();
};

playButtons = function() {
  clearButtons();
  if (analyser && refTmpl)
    registerButton({f: tuneOpen, icon: 'mic', l: 718, t: 470, w: 64, h: 46, hover: false});
};

saveUser = function() {
  try {
    var o = {v: 2, sr: audioCtx.sampleRate, nmel: N_MEL, ncep: N_CEP, t: {}};
    for (var k in userTmpl) o.t[k] = Array.from(userTmpl[k]);
    localStorage.setItem('kana-maze.voice.v2', JSON.stringify(o));
  } catch (e) { /* private mode: stays in memory */ }
};

loadUser = function() {
  try {
    var o = JSON.parse(localStorage.getItem('kana-maze.voice.v2'));
    if (!o || o.v !== 2 || o.sr !== audioCtx.sampleRate || o.nmel !== N_MEL || o.ncep !== N_CEP)
      return false;
    userTmpl = {};
    for (var k in o.t) userTmpl[k] = Float32Array.from(o.t[k]);
    return true;
  } catch (e) { return false; }
};

clearUser = function() {
  userTmpl = null; tryTmpl = {};
  setMeans();
  try { localStorage.removeItem('kana-maze.voice.v2'); } catch (e) {}
};

// ---- loop ----
var lockLoud = 1;

gameLoop = function(ts) {
  var dt = lastTs ? (ts - lastTs) / 1000 : 0;
  lastTs = ts;
  if (dt > 0) fps += (1 / dt - fps) * 0.1;
  dt = Math.min(0.1, dt);          // rAF is throttled in background tabs

  updateSynth(dt);
  readAudio(dt);
  if (!probLock) classify(dt); else loud = lockLoud;

  if (state === 'calprime') primeStep(dt);
  if (state === 'tune') tuneStep(dt);

  if (state === 'play') {
    if (!probLock && !keyProbs() && !analyser) loud = 0;
    if (!startedAt && loud > 0) startedAt = ts;
    if (startedAt) elapsed = (ts - startedAt) / 1000;
    accum += dt;
    while (accum >= DT) { stepPhysics(DT); accum -= DT; }
  } else accum = 0;

  drawFrame();
  window.requestAnimationFrame(gameLoop);
};

// ---- draw ----
drawIcon = function(kind, x, y, sz, col) {
  var h = sz / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineWidth = Math.max(2, sz * 0.09);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'play') {                                    // speaker + waves
    ctx.beginPath();
    ctx.moveTo(-h * 0.85, -h * 0.28); ctx.lineTo(-h * 0.45, -h * 0.28);
    ctx.lineTo(-h * 0.05, -h * 0.7); ctx.lineTo(-h * 0.05, h * 0.7);
    ctx.lineTo(-h * 0.45, h * 0.28); ctx.lineTo(-h * 0.85, h * 0.28);
    ctx.closePath(); ctx.fill();
    for (var i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(-h * 0.05, 0, h * (0.2 + 0.3 * i), -0.9, 0.9);
      ctx.stroke();
    }
  } else if (kind === 'rec') {
    ctx.beginPath(); ctx.arc(0, 0, h * 0.62, 0, 7); ctx.fill();
  } else if (kind === 'stop') {
    ctx.fillRect(-h * 0.45, -h * 0.45, h * 0.9, h * 0.9);
  } else if (kind === 'prev' || kind === 'next') {
    var d = kind === 'next' ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(d * h * 0.45, 0); ctx.lineTo(-d * h * 0.35, -h * 0.55);
    ctx.lineTo(-d * h * 0.35, h * 0.55); ctx.closePath(); ctx.fill();
  } else if (kind === 'check') {
    ctx.beginPath();
    ctx.moveTo(-h * 0.55, 0); ctx.lineTo(-h * 0.12, h * 0.45); ctx.lineTo(h * 0.6, -h * 0.5);
    ctx.stroke();
  } else if (kind === 'back') {
    ctx.beginPath();
    ctx.moveTo(-h * 0.5, -h * 0.5); ctx.lineTo(h * 0.5, h * 0.5);
    ctx.moveTo(h * 0.5, -h * 0.5); ctx.lineTo(-h * 0.5, h * 0.5);
    ctx.stroke();
  } else if (kind === 'mic') {
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.75); ctx.lineTo(0, -h * 0.05);
    ctx.lineWidth = sz * 0.3; ctx.stroke();
    ctx.lineWidth = Math.max(2, sz * 0.09);
    ctx.beginPath(); ctx.arc(0, -h * 0.05, h * 0.42, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, h * 0.37); ctx.lineTo(0, h * 0.72); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-h * 0.35, h * 0.72); ctx.lineTo(h * 0.35, h * 0.72); ctx.stroke();
  } else if (kind === 'nomic') {
    drawIcon('mic', 0, 0, sz, col);
    ctx.strokeStyle = '#ff7070';
    ctx.beginPath(); ctx.moveTo(-h * 0.8, -h * 0.8); ctx.lineTo(h * 0.8, h * 0.8); ctx.stroke();
  } else if (kind === 'keys') {                              // arrow-key cluster
    var k = sz * 0.3, g = sz * 0.05;
    var box = function(cx, cy, dir) {
      ctx.strokeRect(cx - k / 2, cy - k / 2, k, k);
      ctx.beginPath();
      var t = k * 0.22;
      if (dir === 'u') { ctx.moveTo(cx, cy - t); ctx.lineTo(cx - t, cy + t); ctx.lineTo(cx + t, cy + t); }
      if (dir === 'd') { ctx.moveTo(cx, cy + t); ctx.lineTo(cx - t, cy - t); ctx.lineTo(cx + t, cy - t); }
      if (dir === 'l') { ctx.moveTo(cx - t, cy); ctx.lineTo(cx + t, cy - t); ctx.lineTo(cx + t, cy + t); }
      if (dir === 'r') { ctx.moveTo(cx + t, cy); ctx.lineTo(cx - t, cy - t); ctx.lineTo(cx - t, cy + t); }
      ctx.closePath(); ctx.fill();
    };
    ctx.lineWidth = Math.max(1.5, sz * 0.05);
    box(0, -(k + g) / 2 - g, 'u');
    box(-(k + g), (k + g) / 2, 'l');
    box(0, (k + g) / 2, 'd');
    box(k + g, (k + g) / 2, 'r');
  }
  ctx.restore();
};

// the control scheme as a picture: four kana on their axes, brake in the middle
drawScheme = function(cx, cy, R) {
  var v, r, p;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (v in BEAR) {
    r = (BEAR[v] - 90) * Math.PI / 180;
    var ax = Math.cos(r), ay = Math.sin(r);
    ctx.strokeStyle = VCOL[v]; ctx.fillStyle = VCOL[v]; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + ax * R * 0.30, cy + ay * R * 0.30);
    ctx.lineTo(cx + ax * R * 0.72, cy + ay * R * 0.72);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + ax * R * 0.86, cy + ay * R * 0.86);
    ctx.lineTo(cx + ax * R * 0.66 - ay * R * 0.11, cy + ay * R * 0.66 + ax * R * 0.11);
    ctx.lineTo(cx + ax * R * 0.66 + ay * R * 0.11, cy + ay * R * 0.66 - ax * R * 0.11);
    ctx.closePath(); ctx.fill();
    ctx.font = '26px sans-serif';
    ctx.fillText(KANA[v], cx + ax * R * 1.12, cy + ay * R * 1.12);
  }
  // brake: four arrowheads converging on あ
  ctx.fillStyle = VCOL.a;
  for (var i = 0; i < 4; i++) {
    var a = i * Math.PI / 2 + Math.PI / 4;
    var bx = Math.cos(a), by = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cx + bx * R * 0.20, cy + by * R * 0.20);
    ctx.lineTo(cx + bx * R * 0.42 - by * R * 0.09, cy + by * R * 0.42 + bx * R * 0.09);
    ctx.lineTo(cx + bx * R * 0.42 + by * R * 0.09, cy + by * R * 0.42 - bx * R * 0.09);
    ctx.closePath(); ctx.fill();
  }
  ctx.font = '30px sans-serif';
  ctx.fillText(KANA.a, cx, cy);
};

var VCOL = {a: '#e6e6e6', i: '#7fd4ff', u: '#ff9f7f', e: '#b6ff7f', o: '#ff7fd4'};
var C_BG = '#101418', C_WALL = '#39455a', C_FLOOR = '#161c22';
var C_TEXT = '#c8d0d8', C_DIM = '#78828c', C_GOAL = '#40d080', C_BALL = '#ffd866';

drawFrame = function() {
  ctx.fillStyle = C_BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawMaze();
  drawBall();
  drawHud();
  if (state === 'menu') drawMenu();
  if (state === 'micreq') drawWait('mic');
  if (state === 'calprime') drawPrime();
  if (state === 'tune') drawTune();
  if (state === 'won') drawWon();
  drawButtons();
};

panel = function() {
  ctx.fillStyle = 'rgba(8, 11, 14, 0.93)';
  ctx.fillRect(0, 0, MAZE_W, HEIGHT);
};

drawMenu = function() {
  panel();
  drawScheme(MAZE_W / 2, 190, 108);
  drawIcon('mic', MAZE_W / 2 - 56, 366, 42, C_TEXT);
  ctx.strokeStyle = '#2f3a46'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(MAZE_W / 2, 344); ctx.lineTo(MAZE_W / 2, 390); ctx.stroke();
  drawIcon('keys', MAZE_W / 2 + 58, 366, 46, C_DIM);
};

drawWait = function(kind) {
  panel();
  var pulse = 0.55 + 0.45 * Math.sin(performance.now() / 320);
  ctx.globalAlpha = kind === 'mic' ? pulse : 1;
  drawIcon(kind === 'mic' ? 'mic' : 'nomic', MAZE_W / 2, 250, 90, C_TEXT);
  ctx.globalAlpha = 1;
};

drawPrime = function() {
  panel();
  drawIcon('play', MAZE_W / 2, 190, 70, '#80c0ff');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (var i = 0; i < VOWELS.length; i++) {
    var on = i <= primeIdx;
    ctx.globalAlpha = on ? 1 : 0.22;
    ctx.fillStyle = VCOL[VOWELS[i]];
    ctx.font = '34px sans-serif';
    ctx.fillText(KANA[VOWELS[i]], MAZE_W / 2 + (i - 2) * 56, 300);
    ctx.globalAlpha = 1;
  }
};

drawWon = function() {
  panel();
  drawIcon('check', MAZE_W / 2, 200, 96, C_GOAL);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C_BALL; ctx.font = '40px monospace';
  ctx.fillText(fmt(elapsed, 2), MAZE_W / 2, 296);
  drawDots(MAZE_W / 2, 348, lvlIdx + 1);
};

drawDots = function(cx, cy, done) {
  for (var i = 0; i < MAZES.length; i++) {
    var x = cx + (i - (MAZES.length - 1) / 2) * 22;
    ctx.beginPath(); ctx.arc(x, cy, 6, 0, 7);
    if (i < done) { ctx.fillStyle = C_GOAL; ctx.fill(); }
    else { ctx.strokeStyle = '#3a4450'; ctx.lineWidth = 2; ctx.stroke(); }
  }
};

drawMaze = function() {
  for (var r = 0; r < GRID; r++)
    for (var c = 0; c < GRID; c++) {
      ctx.fillStyle = grid[r][c] ? C_WALL : C_FLOOR;
      ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
    }
  var gx = goal[0] * CELL + CELL / 2, gy = goal[1] * CELL + CELL / 2;
  ctx.strokeStyle = C_GOAL; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(gx, gy, GOAL_R, 0, 7); ctx.stroke();
  ctx.globalAlpha = 0.18; ctx.fillStyle = C_GOAL;
  ctx.beginPath(); ctx.arc(gx, gy, GOAL_R, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
};

drawBall = function() {
  ctx.fillStyle = C_BALL;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, 7); ctx.fill();
  var a = accelVec(), m = Math.hypot(a[0], a[1]) * loud;
  if (m > 0.01) {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + a[0] * loud * 34, ball.y + a[1] * loud * 34);
    ctx.stroke();
  }
};

drawHud = function() {
  var active = voiced || probLock || loud > 0;
  ctx.save();
  ctx.globalAlpha = active ? 1 : 0.35;
  drawCompass(750, 120, 85);
  drawBars(615, 232, 170);
  drawMeter(862, 232, 22, 100);
  ctx.restore();

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C_TEXT; ctx.font = '26px monospace';
  ctx.fillText(fmt(elapsed, 2), 750, 372);
  drawDots(750, 404, lvlIdx);
  if (micError) drawIcon('nomic', 750, 444, 30, '#8a949e');

  if (hudMode < 1) return;
  if (hudMode >= 2) drawMelStrip(615, 430, 270, 44);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '12px monospace';
  var y = hudMode >= 2 ? 496 : 440, L = function(t, col) {
    ctx.fillStyle = col || C_DIM; ctx.fillText(t, 615, y); y += 15;
  };
  L('spd ' + fmt(Math.hypot(ball.vx, ball.vy), 0) + '  win<' + WIN_SPEED);
  L('state ' + state + '  fps ' + fmt(fps, 0));
  L('temp ' + fmt(temp, 3) + '  flat ' + fmt(flatness, 3));
  L('lvl ' + fmt(micLevel, 1) + '  flr ' + fmt(noiseFloor, 1) + (voiced ? '  VOICED' : ''));
  L('voice ' + (userTmpl ? 'yours' : 'canonical') + '  cmn ' + (liveMeanN >= LIVE_MEAN_MIN ? 'on' : 'warm'));
  if (synthMode) L('synth ' + synthMode, '#80c0ff');
};

drawCompass = function(cx, cy, R) {
  var v, r;
  ctx.strokeStyle = '#2a3340'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R / 2, 0, 7); ctx.stroke();

  for (v in DIRS) {
    if (probs[v] < 0.005) continue;
    // compass bearing b sits at canvas angle b-90; wedge is +/-30 degrees
    var a0 = (BEAR[v] - 120) * Math.PI / 180, a1 = (BEAR[v] - 60) * Math.PI / 180;
    ctx.fillStyle = VCOL[v]; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, probs[v] * R, a0, a1); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = VCOL.a; ctx.globalAlpha = 0.45;
  ctx.beginPath(); ctx.arc(cx, cy, probs.a * R * 0.55, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;

  var sp = Math.hypot(ball.vx, ball.vy);
  if (sp > 1) drawArrow(cx, cy, ball.vx / sp, ball.vy / sp, sp / MAXV * R, '#5a646e', 2);
  var a = accelVec(), m = Math.hypot(a[0], a[1]);
  if (m > 0.005) drawArrow(cx, cy, a[0] / m, a[1] / m, m * loud * R, '#ffffff', 3);

  ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (v in BEAR) {
    r = (BEAR[v] - 90) * Math.PI / 180;
    ctx.fillStyle = VCOL[v];
    ctx.fillText(KANA[v], cx + Math.cos(r) * (R + 15), cy + Math.sin(r) * (R + 15));
  }
  ctx.fillStyle = VCOL.a; ctx.fillText(KANA.a, cx, cy);
};

drawArrow = function(x, y, ux, uy, len, col, w) {
  if (len < 2) return;
  var ex = x + ux * len, ey = y + uy * len;
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ex + ux * 7, ey + uy * 7);
  ctx.lineTo(ex - uy * 5 - ux * 2, ey + ux * 5 - uy * 2);
  ctx.lineTo(ex + uy * 5 - ux * 2, ey - ux * 5 - uy * 2);
  ctx.closePath(); ctx.fill();
};

drawBars = function(x, y, w) {
  ctx.font = '14px sans-serif'; ctx.textBaseline = 'middle';
  for (var i = 0; i < VOWELS.length; i++) {
    var v = VOWELS[i], yy = y + i * 20;
    ctx.textAlign = 'left'; ctx.fillStyle = VCOL[v];
    ctx.fillText(KANA[v], x, yy + 7);
    ctx.fillStyle = '#1e252d'; ctx.fillRect(x + 22, yy, w, 14);
    ctx.fillStyle = VCOL[v]; ctx.fillRect(x + 22, yy, w * probs[v], 14);
    ctx.textAlign = 'right'; ctx.font = '11px monospace'; ctx.fillStyle = C_DIM;
    ctx.fillText((probs[v] * 100).toFixed(0), x + 22 + w + 22, yy + 7);
    ctx.font = '14px sans-serif';
  }
};

drawMeter = function(x, y, w, h) {
  var lo = noiseFloor - 10, hi = noiseFloor + 40;
  var f = clamp((micLevel - lo) / (hi - lo), 0, 1);
  ctx.fillStyle = '#1e252d'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = voiced ? '#7fd48a' : '#4a545e';
  ctx.fillRect(x, y + h * (1 - f), w, h * f);
  var tick = function(db, col) {
    var t = clamp((db - lo) / (hi - lo), 0, 1);
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y + h * (1 - t)); ctx.lineTo(x + w, y + h * (1 - t)); ctx.stroke();
  };
  tick(noiseFloor, '#5a646e');
  tick(noiseFloor + GATE_DB, '#ffd866');
};

drawMelStrip = function(x, y, w, h) {
  if (!melLog) return;
  var bw = w / N_MEL, mn = 1e9, mx = -1e9, k;
  for (k = 0; k < N_MEL; k++) {
    if (melLog[k] < mn) mn = melLog[k];
    if (melLog[k] > mx) mx = melLog[k];
  }
  ctx.fillStyle = '#1e252d'; ctx.fillRect(x, y, w, h);
  for (k = 0; k < N_MEL; k++) {
    var f = mx > mn ? (melLog[k] - mn) / (mx - mn) : 0;
    ctx.fillStyle = '#3f7f9f';
    ctx.fillRect(x + k * bw, y + h * (1 - f), bw - 1, h * f);
  }
};


var VS = {x: 105, y: 266, w: 390, h: 168};

vsPos = function(F1, F2) {
  // the usual phonetic layout: front/close top-left, back/open bottom-right
  return [VS.x + VS.w * clamp((2500 - F2) / 1800, 0, 1),
          VS.y + VS.h * clamp((F1 - 220) / 680, 0, 1)];
};

drawVowelSpace = function(cur) {
  var v, p, q;
  ctx.fillStyle = '#0d1116'; ctx.fillRect(VS.x, VS.y, VS.w, VS.h);
  ctx.strokeStyle = '#2a3340'; ctx.lineWidth = 1;
  ctx.strokeRect(VS.x, VS.y, VS.w, VS.h);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  for (v in FORMANTS) {
    p = vsPos(FORMANTS[v][0], FORMANTS[v][1]);
    var on = v === cur;
    ctx.globalAlpha = on ? 1 : 0.3;
    ctx.strokeStyle = VCOL[v]; ctx.lineWidth = on ? 2.5 : 1;
    ctx.beginPath(); ctx.arc(p[0], p[1], on ? GOOD_PX : 13, 0, 7); ctx.stroke();
    ctx.fillStyle = VCOL[v]; ctx.font = (on ? 21 : 14) + 'px sans-serif';
    ctx.fillText(KANA[v], p[0], p[1]);
    ctx.globalAlpha = 1;
    var got = tryTmpl[v] && blendPos(tryTmpl[v]);
    if (got) {                           // this voice's attempt, and how far off
      var near = Math.hypot(got[0] - p[0], got[1] - p[1]) <= GOOD_PX;
      ctx.globalAlpha = 0.5; ctx.strokeStyle = VCOL[v]; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(got[0], got[1]); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = VCOL[v];
      ctx.beginPath(); ctx.arc(got[0], got[1], 4.5, 0, 7); ctx.fill();
      if (near) drawIcon('check', p[0] + 17, p[1] - 17, 15, C_GOAL);
    }
  }
  var live = blendPos(cepRaw);
  if (live) {
    ctx.fillStyle = voiced ? '#ffffff' : '#49535d';
    ctx.beginPath(); ctx.arc(live[0], live[1], voiced ? 7 : 4, 0, 7); ctx.fill();
  }
};

drawTune = function() {
  panel();
  var v = VOWELS[tuneIdx], cx = MAZE_W / 2, cy = 120;
  var f = clamp(tuneVoiced / TUNE_HOLD_S, 0, 1);
  ctx.strokeStyle = '#2a3340'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx, cy, 64, 0, 7); ctx.stroke();
  if (tuneRec) {
    ctx.strokeStyle = VCOL[v]; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(cx, cy, 64, -Math.PI / 2, -Math.PI / 2 + f * 7); ctx.stroke();
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = VCOL[v]; ctx.font = '76px sans-serif';
  ctx.fillText(KANA[v], cx, cy);
  if (tuneRec) drawIcon('rec', cx + 86, cy, 22,
    (performance.now() / 300 | 0) % 2 ? '#ff6060' : '#802f2f');

  // which of the five have an attempt, and which already match
  for (var i = 0; i < VOWELS.length; i++) {
    var w = VOWELS[i], x = cx + (i - 2) * 46;
    ctx.globalAlpha = i === tuneIdx ? 1 : 0.4;
    ctx.fillStyle = VCOL[w]; ctx.font = '20px sans-serif';
    ctx.fillText(KANA[w], x, 216);
    ctx.globalAlpha = 1;
    var d = tuneScore(w);
    if (d !== null) {
      ctx.beginPath(); ctx.arc(x, 238, 4, 0, 7);
      ctx.fillStyle = d <= GOOD_PX ? C_GOAL : '#6d7885'; ctx.fill();
    }
  }

  drawVowelSpace(v);
};

// ---- buttons (same immediate-mode pattern as hannoi) ----
registerButton = function(btn) { buttons.push(btn); };
clearButtons = function() { buttons = []; };

getMousePos = function(event) {
  var r = canvas.getBoundingClientRect();
  return [(event.clientX - r.left) * canvas.width / r.width,
          (event.clientY - r.top) * canvas.height / r.height];
};

updateButtons = function(event) {
  var pos = getMousePos(event);
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i], h = b.h || b.fontsize * 1.6;
    b.hover = pos[0] > b.l && pos[0] < b.l + b.w && pos[1] > b.t && pos[1] < b.t + h;
  }
};

drawButtons = function() {
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i], h = b.h || b.fontsize * 1.6;
    ctx.fillStyle = b.hover ? '#28323d' : '#18202a';
    ctx.fillRect(b.l, b.t, b.w, h);
    ctx.strokeStyle = b.hover ? '#7fd4ff' : '#39455a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(b.l, b.t, b.w, h);
    drawIcon(b.icon, b.l + b.w / 2, b.t + h / 2, Math.min(b.w, h) * 0.62,
             b.hover ? '#ffffff' : '#c8d0d8');
  }
};

// ---- debug hooks ----
freqBins = () => FFT_SIZE / 2;

window.kmSetProbs = function(p) {
  if (!p) { probLock = false; return; }
  for (var v in probs) probs[v] = p[v] || 0;
  lockLoud = p.loud === undefined ? 1 : p.loud;
  loud = lockLoud;
  probLock = true;
};

window.kmState = function() {
  var a = accelVec(), out = {};
  for (var v in probs) out[v] = probs[v];
  return {
    x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy,
    speed: Math.hypot(ball.vx, ball.vy),
    probs: out, accel: a, mag: Math.hypot(a[0], a[1]),
    bearing: (Math.atan2(a[0], -a[1]) * 180 / Math.PI + 360) % 360,
    loud: loud, micLevel: micLevel, noiseFloor: noiseFloor, flatness: flatness,
    voiced: voiced, state: state, temp: temp, level: lvlIdx, elapsed: elapsed,
    voice: userTmpl ? 'user' : 'canonical', tuned: Object.keys(tryTmpl).length,
    cmnReady: liveMeanN >= LIVE_MEAN_MIN, sampleRate: audioCtx ? audioCtx.sampleRate : 0
  };
};

window.kmTest = function() {
  var out = [], pass = 0;
  var ok = function(n, c, d) { out.push((c ? 'PASS  ' : 'FAIL  ') + n + (d ? '   [' + d + ']' : '')); if (c) pass++; };
  var k, n, s, i;

  if (!binHz) {                       // let the dsp tests run with no mic at all
    binHz = 48000 / FFT_SIZE;
    buildMelBanks(); buildDctTable();
    melLog = new Float32Array(N_MEL);
    cepRaw = new Float32Array(N_CEP);
    liveMean = new Float32Array(N_CEP);
    tmplMean = new Float32Array(N_CEP);
    refMean = new Float32Array(N_CEP);
    scratchA = new Float32Array(N_CEP);
    scratchB = new Float32Array(N_CEP);
  }

  var rt = true;
  for (var f = 150; f < 4000; f += 37)
    if (Math.abs(mel2hz(hz2mel(f)) - f) > 1e-6 * f) rt = false;
  ok('mel round-trip', rt);

  var wide = true, mono = true, nyq = true, prev = -1, thin = '';
  for (k = 0; k < N_MEL; k++) {
    if (melBanks[k].w.length < 2) { wide = false; thin = 'band ' + k; }
    if (melBanks[k].start <= prev) mono = false;
    prev = melBanks[k].start;
    if (melBanks[k].start + melBanks[k].w.length > freqBins()) nyq = false;
  }
  ok('every mel band spans >= 2 bins', wide, thin || (melBanks[0].w.length + ' at band 0'));
  ok('mel band starts monotonic', mono);
  ok('last mel band within nyquist', nyq);

  var save = Float32Array.from(melLog), c = [];
  for (k = 0; k < N_MEL; k++) melLog[k] = Math.cos(Math.PI * 3 * (k + 0.5) / N_MEL);
  for (n = 0; n < N_CEP; n++) { s = 0; for (k = 0; k < N_MEL; k++) s += melLog[k] * dctTable[n][k]; c.push(s); }
  var peak = 0, clean = true;
  for (n = 0; n < N_CEP; n++) {
    if (Math.abs(c[n]) > Math.abs(c[peak])) peak = n;
    if (n !== 3 && Math.abs(c[n]) > 1e-6) clean = false;
  }
  ok('dct-ii spikes at c3 only', peak === 3 && clean, 'c3=' + c[3].toFixed(3));
  melLog.set(save);

  // softmax sign: the nearest centroid must win, not the furthest
  var su = userTmpl, sraw = Float32Array.from(cepRaw), sv = voiced, st = temp;
  var sn = liveMeanN, sp = {};
  for (var z in probs) sp[z] = probs[z];
  userTmpl = {};
  for (i = 0; i < VOWELS.length; i++) {
    var cv = new Float32Array(N_CEP); cv[1 + i] = 1;
    userTmpl[VOWELS[i]] = cv;
  }
  setMeans();
  for (n = 0; n < N_CEP; n++) cepRaw[n] = 0;
  cepRaw[3] = 1;                                  // index 1+2 -> matches 'u'
  voiced = true; temp = 0.25; probLock = false; liveMeanN = 0;   // mean off
  classify(999);
  var win = 'a';
  for (z in probs) if (probs[z] > probs[win]) win = z;
  ok('softmax picks the nearest template', win === 'u', 'p(u)=' + probs.u.toFixed(3));
  userTmpl = su; cepRaw.set(sraw); voiced = sv; temp = st; liveMeanN = sn;
  setMeans();
  for (z in probs) probs[z] = sp[z];

  window.kmSetProbs({u: 0.52, i: 0.30, a: 0.18});
  var b = window.kmState().bearing;
  ok('52% u + 30% i -> bearing 330', Math.abs(b - 330) < 0.5, b.toFixed(2));

  window.kmSetProbs({u: 0.5, e: 0.5});
  ok('u+e (adjacent) -> bearing 45', Math.abs(window.kmState().bearing - 45) < 1e-6);

  window.kmSetProbs({u: 0.5, o: 0.5});
  ok('u/o 50-50 cancels to zero thrust', window.kmState().mag < 1e-9,
     window.kmState().mag.toExponential(1));

  window.kmSetProbs({u: 0.85, o: 0.10});
  ok('u/o 85-10 -> 0.75 up', Math.abs(window.kmState().mag - 0.75) < 1e-9 &&
     Math.abs(window.kmState().bearing) < 1e-9);

  // brake and coast, integrated at the real fixed step
  var sball = {x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy}, sst = state, sl = lvlIdx;
  state = 'test';
  ball.vx = 200; ball.vy = 0;
  window.kmSetProbs({a: 1});
  var t = 0;
  while (Math.abs(ball.vx) > 100 && t < 5) { applyAccel(DT); t += DT; }
  var expect = Math.LN2 / (DAMP_BASE + DAMP_A);
  ok('brake halves |v| in ln2/(damp_base+damp_a)', Math.abs(t - expect) < 0.005,
     fmt(t * 1000, 0) + 'ms vs ' + fmt(expect * 1000, 0) + 'ms');

  ball.vx = 200; ball.vy = 0;
  window.kmSetProbs({loud: 0});
  t = 0;
  while (Math.abs(ball.vx) > 200 / Math.E && t < 10) { applyAccel(DT); t += DT; }
  ok('coast tau = 1/damp_base', Math.abs(t - 1 / DAMP_BASE) < 0.02, fmt(t, 2) + 's');

  // an 80ms gate dropout mid-run must cost under 5% of velocity
  ball.vx = 200; ball.vy = 0;
  for (t = 0; t < 0.08; t += DT) applyAccel(DT);
  ok('80ms thrust dropout costs < 5% of v', ball.vx > 200 * 0.95,
     fmt((1 - ball.vx / 200) * 100, 1) + '%');

  // collision: never end up inside a wall
  loadMaze(0);
  state = 'test';
  ball.x = CELL * 1.5; ball.y = CELL * 1.5; ball.vx = MAXV; ball.vy = MAXV * 0.6;
  var bad = 0;
  for (i = 0; i < 1200; i++) {
    stepPhysics(DT);
    var cc = (ball.x / CELL) | 0, rr = (ball.y / CELL) | 0;
    if (grid[rr] && grid[rr][cc]) bad++;
  }
  ok('ball never inside a wall over 10s', bad === 0, bad + ' frames');

  // press up into the top wall while thrusting right: it must slide, not stick
  loadMaze(0);
  state = 'test';
  ball.x = CELL * 2; ball.y = CELL + BALL_R - 0.5;
  ball.vx = 200; ball.vy = 0;
  window.kmSetProbs({u: 0.35, e: 0.65});
  var x0 = ball.x, touched = 0;
  for (i = 0; i < 120; i++) { stepPhysics(DT); if (touchNx || touchNy) touched++; }
  ok('slides along a wall instead of sticking', ball.x - x0 > 150 && touched > 100,
     fmt(ball.x - x0, 0) + 'px in 1s, in contact ' + touched + '/120 steps');

  window.kmSetProbs(null);
  loadMaze(sl);
  ball.x = sball.x; ball.y = sball.y; ball.vx = sball.vx; ball.vy = sball.vy;
  state = sst;

  var total = out.length;
  out.push('');
  out.push(pass + '/' + total + ' passed');
  console.log(out.join('\n'));
  return out;
};
