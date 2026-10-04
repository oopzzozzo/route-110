(function () {
  var INITIALS = ['', 'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ',
    'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ'];
  var MEDIALS = ['', 'ㄧ', 'ㄨ', 'ㄩ'];
  var FINALS = ['', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ'];
  var TONES = ['', 'ˊ', 'ˇ', 'ˋ', '˙']; // first tone is unmarked

  // Data files sit next to this script; see build_data.py.
  var BASE = document.currentScript.src.replace(/[^\/]*$/, '');
  var POP_LIMIT = 400; // chars listed per popover
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var T = EN ? {
    tone: 'Tone', medial: 'Medial', group: 'Split by', all: 'All', none: 'None',
    toneNames: ['1st ˉ', '2nd ˊ', '3rd ˇ', '4th ˋ', 'Neutral ˙'],
    medialNames: ['None', 'ㄧ', 'ㄨ', 'ㄩ'],
    primaryOnly: 'Primary reading only (skip alternate readings of polyphones)',
    corner: 'Final \\ Initial', empty: '∅', total: 'Sum',
    chars: function (n) { return n + (n === 1 ? ' char' : ' chars'); },
    summary: function (c, r) { return c + ' chars' + (r > c ? ' (' + r + ' counting each reading of polyphones)' : ''); },
    more: function (n) { return '… and ' + n + ' more'; },
    charset: 'Character set',
    charsets: { all: 'All', moe1: 'Common', moe2: 'Less common', moe3: 'Rare', 'big5-1': 'Big5 common', 'big5-2': 'Big5 less common' },
    medialLabel: function (m) { return m ? 'medial ' + m : 'no medial'; },
    source: 'Readings', loading: 'Loading…', failed: 'Failed to load data.',
    sources: {
      chewing: {
        label: 'Chewing', name: 'libchewing dictionary', url: 'https://github.com/chewing/libchewing-data',
        license: 'LGPL-2.1',
        version: function (v) { return 'word.csv ' + v['word.csv'] + ', tsi.csv ' + v['tsi.csv']; }
      },
      moe: {
        label: 'MOE dictionary', name: 'MOE Revised Mandarin Chinese Dictionary', url: 'https://github.com/g0v/moedict-data',
        license: 'CC BY-ND 3.0 TW',
        version: function (v) { return '6th online edition ' + v.edition + ', moedict-data ' + v['moedict-data']; }
      },
      cns: {
        label: 'CNS11643', name: 'CNS11643 Chinese Standard Interchange Code', url: 'https://www.cns11643.gov.tw/',
        license: 'Open Government Data License v1.0',
        version: function (v) { return 'release ' + v.release; }
      }
    }
  } : {
    tone: '聲調', medial: '介母', group: '分表', all: '全部', none: '不分表',
    toneNames: ['一聲 ˉ', '二聲 ˊ', '三聲 ˇ', '四聲 ˋ', '輕聲 ˙'],
    medialNames: ['無', 'ㄧ', 'ㄨ', 'ㄩ'],
    primaryOnly: '只計主要讀音（略過破音字的其他讀音）',
    corner: '韻＼聲', empty: '∅', total: '計',
    chars: function (n) { return n + ' 字'; },
    summary: function (c, r) { return c + ' 字' + (r > c ? '，含破音共 ' + r + ' 字音' : ''); },
    more: function (n) { return '…等，另有 ' + n + ' 字'; },
    charset: '字集',
    charsets: { all: '全部', moe1: '常用字', moe2: '次常用字', moe3: '罕用字', 'big5-1': 'Big5 常用', 'big5-2': 'Big5 次常用' },
    medialLabel: function (m) { return m ? '介母 ' + m : '無介母'; },
    source: '讀音', loading: '載入中…', failed: '資料載入失敗。',
    sources: {
      chewing: {
        label: '新酷音', name: '新酷音詞庫', url: 'https://github.com/chewing/libchewing-data',
        license: 'LGPL-2.1',
        version: function (v) { return 'word.csv ' + v['word.csv'] + '、tsi.csv ' + v['tsi.csv']; }
      },
      moe: {
        label: '教育部辭典', name: '教育部《重編國語辭典修訂本》', url: 'https://github.com/g0v/moedict-data',
        license: 'CC BY-ND 3.0 TW',
        version: function (v) { return '臺灣學術網路第六版（' + v.edition + '），萌典資料 ' + v['moedict-data']; }
      },
      cns: {
        label: '全字庫', name: 'CNS11643 中文標準交換碼全字庫', url: 'https://www.cns11643.gov.tw/',
        license: '政府資料開放授權條款第1版',
        version: function (v) { return v.release + ' 版'; }
      }
    }
  };

  // Decode a generated data chunk: see build_data.py.
  var syllables = {};

  function syllable(code) {
    if (!syllables[code]) {
      var t = code % 5, rest = (code - t) / 5, f = rest % 14;
      rest = (rest - f) / 14;
      var m = rest % 4, i = (rest - m) / 4;
      var p = { i: INITIALS[i], m: MEDIALS[m], f: FINALS[f], t: t };
      p.text = p.i + p.m + p.f + TONES[t];
      syllables[code] = p;
    }
    return syllables[code];
  }

  function decode(e) {
    var entries = [];
    for (var k = 0; k < e.length; k += 6) {
      var c = e.charCodeAt(k), n = c >= 0xD800 && c <= 0xDBFF ? 2 : 1; // astral chars take two units
      k += n;
      entries.push({
        ch: e.substr(k - n, n),
        s: syllable(parseInt(e.substr(k, 3), 36)),
        key: parseInt(e.substr(k + 3, 2), 36),
        primary: e[k + 5] === '1'
      });
    }
    return entries;
  }

  // Chunks are fetched only when a selection first needs them: file -> entries, or 'loading' / 'failed'.
  var loaded = {};

  function load(file, key) {
    if (loaded[file]) return loaded[file];
    loaded[file] = 'loading';
    var script = document.createElement('script');
    script.src = BASE + file;
    script.onload = function () {
      var raw = window.BOPOMOFO_CHUNKS && window.BOPOMOFO_CHUNKS[key];
      loaded[file] = typeof raw === 'string' ? decode(raw) : 'failed';
      delete window.BOPOMOFO_CHUNKS[key];
      render();
    };
    script.onerror = function () { loaded[file] = 'failed'; render(); };
    document.head.appendChild(script);
    return loaded[file];
  }

  // Chunks a selection of character sets covers: chunk "<MOE tier><Big5 tier>".
  function chunksFor(source, sets) {
    return BOPOMOFO_MANIFEST[source].chunks.filter(function (c) {
      return sets.all || sets['moe' + c[0]] || sets['big5-' + c[1]];
    });
  }

  var merged = {}; // "source|chunks" -> entries in display order

  function entriesFor(source, chunks) {
    var id = source + '|' + chunks.join(), parts = [];
    if (merged[id]) return merged[id];
    for (var i = 0; i < chunks.length; i++) {
      var d = load('bopomofo-data-' + source + '-' + chunks[i] + '.js', source + '-' + chunks[i]);
      if (d === 'failed') return 'failed';
      parts.push(d);
    }
    if (parts.some(function (d) { return d === 'loading'; })) return 'loading';
    // Each chunk is sorted; a stable sort on the shared key restores the overall order.
    return merged[id] = [].concat.apply([], parts).sort(function (a, b) { return a.key - b.key; });
  }

  var state = { source: 'chewing', charsets: { moe1: true }, tone: 'all', medial: 'all', group: 'none', primaryOnly: false };
  var data; // { freq, entries } of the current selection, once loaded
  var root, controls, output, pop, pinned = null, cells = {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function segmented(label, key, options) {
    var row = el('div', 'bt-row');
    row.appendChild(el('span', 'bt-label', label));
    var seg = el('div', 'bt-seg');
    options.forEach(function (o) {
      var b = el('button', state[key] === o[0] ? 'bt-on' : '', o[1]);
      b.type = 'button';
      b.setAttribute('aria-pressed', state[key] === o[0]);
      b.onclick = function () { state[key] = o[0]; render(); };
      seg.appendChild(b);
    });
    row.appendChild(seg);
    return row;
  }

  // Multiple choice; "all" excludes the others, and at least one stays selected.
  function charsetRow() {
    var row = el('div', 'bt-row');
    row.appendChild(el('span', 'bt-label', T.charset));
    var seg = el('div', 'bt-seg');
    Object.keys(T.charsets).forEach(function (k) {
      var on = !!state.charsets[k];
      var b = el('button', on ? 'bt-on' : '', T.charsets[k]);
      b.type = 'button';
      b.setAttribute('aria-pressed', on);
      b.onclick = function () {
        var next = {};
        if (k !== 'all') {
          for (var c in state.charsets) if (c !== 'all') next[c] = true;
          if (on) delete next[k]; else next[k] = true;
        }
        if (!Object.keys(next).length) next.all = true;
        state.charsets = next;
        render();
      };
      seg.appendChild(b);
    });
    row.appendChild(seg);
    return row;
  }

  function renderControls() {
    controls.textContent = '';
    controls.appendChild(charsetRow());
    controls.appendChild(segmented(T.source, 'source', Object.keys(T.sources).map(function (k) {
      return [k, T.sources[k].label];
    })));
    var src = T.sources[state.source], note = el('div', 'bt-note'), about = el('span');
    var link = el('a', '', src.name);
    link.href = src.url;
    about.appendChild(link);
    var man = BOPOMOFO_MANIFEST[state.source];
    var meta = [src.version(man.versions), src.license];
    about.appendChild(document.createTextNode(' · ' + meta.join(' · ')));
    note.appendChild(about);
    controls.appendChild(note);
    // Primary readings come from frequency data; without it the option is forced off.
    var canPrimary = man.freq;
    var lab = el('label', 'bt-check' + (canPrimary ? '' : ' bt-disabled'));
    var cb = el('input');
    cb.type = 'checkbox';
    cb.checked = state.primaryOnly;
    cb.disabled = !canPrimary;
    cb.onchange = function () { state.primaryOnly = cb.checked; render(); };
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(' ' + T.primaryOnly));
    note.appendChild(lab);
    controls.appendChild(segmented(T.tone, 'tone', [['all', T.all]].concat(
      T.toneNames.map(function (n, i) { return [i, n]; }))));
    controls.appendChild(segmented(T.medial, 'medial', [['all', T.all]].concat(
      T.medialNames.map(function (n, i) { return [i, n]; }))));
    var groups = [['none', T.none]];
    if (state.tone === 'all') groups.push(['tone', T.tone]);
    if (state.medial === 'all') groups.push(['medial', T.medial]);
    if (groups.length > 1) controls.appendChild(segmented(T.group, 'group', groups));
  }

  function buildGroups() {
    var list = data.entries.filter(function (e) {
      return (state.tone === 'all' || e.s.t === state.tone) &&
        (state.medial === 'all' || e.s.m === MEDIALS[state.medial]) &&
        (!state.primaryOnly || e.primary);
    });
    var groups;
    if (state.group === 'tone') {
      groups = TONES.map(function (_, t) {
        return { title: T.toneNames[t], items: list.filter(function (e) { return e.s.t === t; }) };
      });
    } else if (state.group === 'medial') {
      groups = MEDIALS.map(function (m) {
        return { title: T.medialLabel(m), items: list.filter(function (e) { return e.s.m === m; }) };
      });
    } else {
      groups = [{ title: '', items: list }];
    }
    groups.forEach(function (g) {
      g.cells = {};
      g.items.forEach(function (e) {
        var key = e.s.f + '|' + e.s.i;
        (g.cells[key] = g.cells[key] || []).push(e);
      });
    });
    return groups;
  }

  function renderTables() {
    output.textContent = '';
    cells = {};
    hide(true);
    var groups = buildGroups();
    var max = 1;
    groups.forEach(function (g) {
      for (var key in g.cells) max = Math.max(max, g.cells[key].length);
    });
    groups.forEach(function (g, gi) {
      // Drop empty groups; an empty ungrouped selection keeps just its "0" caption.
      if (!g.items.length && groups.length > 1) return;
      var head = el('div', 'bt-caption');
      if (g.title) head.appendChild(el('strong', '', g.title + ' '));
      var unique = {};
      g.items.forEach(function (e) { unique[e.ch] = 1; });
      head.appendChild(document.createTextNode(T.summary(Object.keys(unique).length, g.items.length)));
      output.appendChild(head);
      if (!g.items.length) return;


      var table = el('table', 'bt-table');
      var tr = el('tr');
      tr.appendChild(el('th', 'bt-corner', T.corner));
      INITIALS.forEach(function (i) { tr.appendChild(el('th', '', i || T.empty)); });
      tr.appendChild(el('th', 'bt-sum', T.total));
      table.appendChild(el('thead')).appendChild(tr);

      var tbody = table.appendChild(el('tbody'));
      var colSum = INITIALS.map(function () { return 0; });
      FINALS.forEach(function (r) {
        var tr = el('tr'), rowSum = 0;
        tr.appendChild(el('th', 'bt-rowhead', r || T.empty));
        INITIALS.forEach(function (i, ii) {
          var key = r + '|' + i, items = g.cells[key];
          var td = el('td');
          if (items) {
            td.textContent = items.length;
            td.tabIndex = 0;
            td.dataset.cell = gi + '/' + key;
            td.style.backgroundColor = 'rgba(var(--color-secondary-600), ' +
              (0.08 + 0.5 * Math.sqrt(items.length / max)).toFixed(3) + ')';
            cells[gi + '/' + key] = { items: items, initial: i, rhyme: r, group: g.title };
            rowSum += items.length;
            colSum[ii] += items.length;
          }
          tr.appendChild(td);
        });
        tr.appendChild(el('td', 'bt-sum', rowSum || ''));
        tbody.appendChild(tr);
      });
      var foot = el('tr');
      foot.appendChild(el('th', 'bt-rowhead', T.total));
      colSum.forEach(function (n) { foot.appendChild(el('td', 'bt-sum', n || '')); });
      foot.appendChild(el('td', 'bt-sum', g.items.length));
      table.appendChild(el('tfoot')).appendChild(foot);

      var wrap = el('div', 'bt-wrap');
      wrap.appendChild(table);
      output.appendChild(wrap);
    });
  }

  function charSpan(e) {
    var s = el('span', e.primary ? '' : 'bt-alt', e.ch);
    s.title = e.s.text;
    return s;
  }

  function show(td) {
    var c = cells[td.dataset.cell];
    if (!c) return;
    pop.textContent = '';
    var title = el('div', 'bt-pop-title');
    // Rows merge medials; name the medial only when the whole cell shares one.
    var medials = {};
    c.items.forEach(function (e) { medials[e.s.m] = 1; });
    medials = Object.keys(medials);
    var name = c.initial + (medials.length === 1 ? medials[0] : '') + c.rhyme;
    title.appendChild(el('strong', '', name || T.empty));
    var meta = [c.group, state.tone !== 'all' ? T.toneNames[state.tone] : '', T.chars(c.items.length)];
    title.appendChild(document.createTextNode(' ' + meta.filter(Boolean).join(' · ')));
    pop.appendChild(title);
    // One line per syllable (medial, then tone), labelled when there are several.
    var lines = {};
    c.items.forEach(function (e) {
      var k = MEDIALS.indexOf(e.s.m) * 10 + e.s.t;
      (lines[k] = lines[k] || []).push(e);
    });
    var keys = Object.keys(lines).sort(function (a, b) { return a - b; });
    var room = POP_LIMIT;
    keys.forEach(function (k) {
      var list = lines[k], line = el('div', 'bt-pop-chars');
      if (keys.length > 1) {
        line.appendChild(el('span', 'bt-pop-tone',
          medials.length > 1 ? list[0].s.text : T.toneNames[list[0].s.t]));
      }
      list.slice(0, Math.max(room, 0)).forEach(function (e) { line.appendChild(charSpan(e)); });
      if (list.length > room) line.appendChild(el('span', 'bt-pop-more', T.more(list.length - Math.max(room, 0))));
      room -= list.length;
      pop.appendChild(line);
    });
    pop.hidden = false;
    var r = td.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), document.documentElement.clientWidth - w - 8);
    var y = r.bottom + 6;
    if (y + h > window.innerHeight) {
      y = r.top - h - 6 > 0 ? r.top - h - 6 : Math.max(8, window.innerHeight - h - 8);
    }
    pop.style.left = (x + window.scrollX) + 'px';
    pop.style.top = (y + window.scrollY) + 'px';
  }

  function hide(force) {
    if (pinned && !force) return;
    if (pinned) pinned.classList.remove('bt-pinned');
    pinned = null;
    pop.hidden = true;
  }

  function render() {
    // Grouping only applies to a dimension left at "all".
    if (state.group !== 'none' && state[state.group] !== 'all') state.group = 'none';
    var man = BOPOMOFO_MANIFEST[state.source];
    var entries = entriesFor(state.source, chunksFor(state.source, state.charsets));
    data = typeof entries === 'object' ? { freq: man.freq, entries: entries } : null;
    if (!man.freq) state.primaryOnly = false;
    renderControls();
    if (data) {
      renderTables();
    } else {
      hide(true);
      output.textContent = '';
      output.appendChild(el('p', 'bt-caption', entries === 'failed' ? T.failed : T.loading));
    }
  }

  function cellOf(target) {
    return target.closest && target.closest('td[data-cell]');
  }

  var CSS = [
    '#bopomofo-table .bt-row{display:flex;flex-wrap:wrap;align-items:center;gap:.4em;margin:.4em 0}',
    '#bopomofo-table .bt-label{min-width:' + (EN ? '7.5em' : '4.5em') + ';font-weight:600}',
    '#bopomofo-table .bt-seg{display:flex;flex-wrap:wrap;gap:.25em}',
    '#bopomofo-table .bt-seg button{padding:.15em .7em;border:1px solid rgba(var(--color-neutral-500),.5);border-radius:999px;font-size:.9em;cursor:pointer}',
    '#bopomofo-table .bt-seg button.bt-on{background:rgb(var(--color-secondary-600));border-color:rgb(var(--color-secondary-600));color:#fff}',
    '#bopomofo-table .bt-note{display:flex;flex-wrap:wrap;align-items:center;gap:.2em 1.2em;margin:.1em 0 .5em;font-size:.85em}',
    '#bopomofo-table .bt-note>span{opacity:.8}',
    '#bopomofo-table .bt-check{display:inline-flex;align-items:center;gap:.3em;cursor:pointer}',
    '#bopomofo-table .bt-check.bt-disabled{opacity:.45;cursor:not-allowed}',
    '#bopomofo-table .bt-caption{margin:1.4em 0 .3em;font-size:.95em}',
    '#bopomofo-table .bt-wrap{overflow-x:auto}',
    '#bopomofo-table table.bt-table{border-collapse:collapse;margin:0;font-size:.8em;width:auto;table-layout:auto}',
    '#bopomofo-table .bt-table th,#bopomofo-table .bt-table td{box-sizing:border-box;width:2.8em;min-width:2.8em;max-width:2.8em;padding:.2em .1em;overflow:hidden;text-align:center;border:1px solid rgba(var(--color-neutral-500),.25);font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#bopomofo-table .bt-table th{font-weight:600}',
    '#bopomofo-table .bt-table .bt-rowhead,#bopomofo-table .bt-table .bt-corner{position:sticky;left:0;z-index:1;background:rgb(var(--color-neutral-50))}',
    'html.dark #bopomofo-table .bt-table .bt-rowhead,html.dark #bopomofo-table .bt-table .bt-corner{background:rgb(var(--color-neutral-800))}',
    '#bopomofo-table .bt-table .bt-corner{font-size:.7em;font-weight:400;opacity:.7;white-space:normal;line-height:1.1;width:4em;min-width:4em;max-width:4em}',
    '#bopomofo-table .bt-table .bt-sum{opacity:.65;font-size:.8em;width:3.5em;min-width:3.5em;max-width:3.5em}', // 2.8em at the smaller font
    '#bopomofo-table .bt-table td[data-cell]{cursor:pointer}',
    '#bopomofo-table .bt-table td[data-cell]:hover,#bopomofo-table .bt-table td[data-cell]:focus,#bopomofo-table .bt-table td.bt-pinned{outline:2px solid rgb(var(--color-secondary-600));outline-offset:-2px}',
    '#bt-pop{position:absolute;z-index:50;max-width:min(24em,calc(100vw - 16px));max-height:50vh;overflow-y:auto;padding:.6em .8em;border:1px solid rgba(var(--color-neutral-500),.5);border-radius:.4em;background:rgb(var(--color-neutral-50));box-shadow:0 4px 16px rgba(0,0,0,.15);font-size:.95em}',
    'html.dark #bt-pop{background:rgb(var(--color-neutral-800))}',
    '#bt-pop .bt-pop-title{margin-bottom:.3em}',
    '#bt-pop .bt-pop-chars{font-size:1.3em;line-height:1.6;word-break:break-all}',
    '#bt-pop .bt-pop-tone{display:inline-block;min-width:4.2em;font-size:.65em;opacity:.7}',
    '#bt-pop .bt-alt{opacity:.4}',
    '#bt-pop .bt-pop-more{margin-left:.4em;font-size:.65em;opacity:.7}'
  ].join('\n');

  function init() {
    root = document.getElementById('bopomofo-table');
    if (!root) return;
    var style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    controls = root.appendChild(el('div', 'bt-controls'));
    output = root.appendChild(el('div'));
    pop = document.body.appendChild(el('div'));
    pop.id = 'bt-pop';
    pop.hidden = true;

    output.addEventListener('mouseover', function (ev) {
      var td = cellOf(ev.target);
      if (pinned) return;
      if (td) show(td); else hide();
    });
    output.addEventListener('mouseleave', function () { hide(); });
    output.addEventListener('focusin', function (ev) {
      var td = cellOf(ev.target);
      if (td && !pinned) show(td);
    });
    output.addEventListener('click', function (ev) {
      var td = cellOf(ev.target);
      if (!td) return;
      var again = pinned === td;
      hide(true);
      if (again) return;
      show(td);
      pinned = td;
      td.classList.add('bt-pinned');
    });
    document.addEventListener('click', function (ev) {
      if (pinned && !cellOf(ev.target) && !pop.contains(ev.target)) hide(true);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') hide(true);
    });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
