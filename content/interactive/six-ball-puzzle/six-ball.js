var WIDTH = 800;
var HEIGHT = 600;
var BALLSIZE = 45;
var COLORS = 5;
var ROWS = 11;
var COLUMNS = 19;
var MARGIN = 30;
var canvas;
var ctx;
var FPS = 30;
var ZSPEED = 2; // BPS
var level = 5;
var colors = [];
var jar = [...Array(ROWS)].map(r=>Array(COLUMNS).fill(0));
var BUFF = []
var BUFF_AT = [0, 10] // curr_idx, max_size
var STORAGE
var next = [...Array(3)].map(_ => (Math.random() * COLORS + 1)>>0)
var curr = [...Array(3)].map(_ => (Math.random() * COLORS + 1)>>0)
var cursor = [(COLUMNS + 1) / 2, ROWS, 0];

var SQRT3 = Math.sqrt(3)

window.onload = function(){
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = WIDTH;
  ctx.canvas.height = HEIGHT;
  colors = getColors();
  canvas.addEventListener('keydown', gameControl)
  window.requestAnimationFrame(gameLoop);
};

formatRGB = (r, g, b) => "rgb(" + 255*r + ", " + 255*g + ", " + 255*b + ")";
rotateArray = (arr, off) => arr.slice(arr.length-off, arr.length).concat(arr.slice(0, arr.length-off));
getColors = function() {
  linear2RGB = function(l) {
    l *= 6;
    pos = l % 2;
    rgb = [Math.min(1, 2-pos), Math.min(1, pos), 0];
    rgb = rotateArray(rgb, (l/2)>>0);
    return formatRGB(rgb[0], rgb[1], rgb[2]);
  }
  return [''].concat([...Array(COLORS).keys()].map(idx=>linear2RGB(idx / COLORS)))
}

gameControl = function(event) {
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key))
    event.preventDefault();
  switch(event.key) {
    case 'x':
      cursor[2] = (cursor[2] + 1) % 6;
      break;
    case 'z':
      cursor[2] = (cursor[2] + 5) % 6;
      break;
    case 'ArrowRight':
      cursor[0] = Math.min(cursor[0]+1, COLUMNS-2);
      break;
    case 'ArrowLeft':
      cursor[0] = Math.max(cursor[0]-1, 1);
      break;
    case 'ArrowDown':
      // TODO soft drop
      break;
    case 'ArrowUp':
      commitCursor()
      chain()
      break;
    case 'Shift':
      quake()
      break;
    case ' ':
      fire()
      break;
    case 'q':
      revert()
      break;
    case 'w':
      redo()
      break;
    case 's':
      store()
      break;
    case 'l':
      loadBuff(STORAGE)
  }
  if([' '].includes(event.key))
    backup();
}

backup = function() {
  BUFF = BUFF.slice(BUFF_AT[0], BUFF_AT[1])
  BUFF.unshift(getState())
  BUFF_AT[0] = 0
}

getState = function() {
  return JSON.stringify([jar, next, curr, cursor])
}

revert = function() {
  if(BUFF_AT[0]+1 < BUFF.length) {
    BUFF_AT[0]++
    loadBuff()
  }
}

redo = function() {
  if(BUFF_AT[0]) {
    BUFF_AT[0]--
    loadBuff()
  }
}

store = function() {
  STORAGE = getState()
}

loadBuff = function(buff) {
  if(buff === undefined)
    buff = BUFF[BUFF_AT[0]];
  [jar, next, curr, cursor] = JSON.parse(buff);
}

gameLoop = function(timestamp) {
  drawFrame();
  window.requestAnimationFrame(gameLoop);
}

getCursorDropPos = function() {
  // TODO
  rows = rotateArray([[1, 0, 0], [0, 0, -1]][cursor[2]%2], (cursor[2]/2)>>0)
  cols = rotateArray([[0, -1, 1], [1, -1, 0]][cursor[2]%2], (cursor[2]/2)>>0)
  for(var b=0; b<3; b++)
    cols[b] += cursor[0];
  off = cursor[2]%2;
  for(var r=0; r<ROWS; r++)
    for(var b=0; b<3; b++){
      if(jar[r][cols[b]] || jar[r][cols[b]-1] || jar[r][cols[b]+1])
        off = Math.max(off, r+1)
      if(cursor[2]%2 && jar[r][cols[b]])
        off = Math.max(off, r+2)
    }
      
  return repairParities(rows.map((r, idx) => [r+off, cols[idx]]))
}

repairParities = function(poses) {
  pos = poses[0]
  if(pos[0] % 2 == pos[1] % 2)
    return poses

  minC = poses.reduce((minc, pos) => Math.min(minc, pos[1]), COLUMNS-1)
  off = minC? -1:1
  return poses.map(pos => [pos[0],pos[1]+off])
}

fire = function() {
  exploded = false
  for(var r=0; r<ROWS; r++)
    for(var c=0; c<COLUMNS; c++)
      if(jar[r][c]) 
        exploded = exploded || explodeBalls(bfs(r, c, jar[r][c]))
  backup();
  return exploded
}

explodeBalls = function(poses) {
  if(poses.length >= 6) {
    for(var b=0; b<poses.length; b++) {
      [r, c] = poses[b]
      jar[r][c] = 0;
    }
    return true
  }
  return false
}

bfs = function(r, c, color) {
  balls = [[r,c]]
  dirs = [[0, 2], [-1, 1], [-1, -1], [0, -2], [1, -1], [1, 1]]
  for(var b=0; b<balls.length; b++) {
    for(dir of dirs) {
      rr = balls[b][0] + dir[0]
      cc = balls[b][1] + dir[1]
      if(inJar(rr, cc) && jar[rr][cc] == color && !inList(rr, cc, balls))
        balls.push([rr, cc])  
    }
  }
  return balls
}

inJar = function(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLUMNS
}
inList = function(r, c, list) {
  for(e of list)
    if(e[0] == r && e[1] == c)
      return true
  return false
}

chain = function() {
  do{
    quake();
    exploded = fire();
  } while (exploded);
}

quake = function() {
  shift = true;
  while(shift){
    shift = false
    for(var r=1; r<ROWS; r++) {
      for(var c=r%2; c<COLUMNS; c+=2) {
        move = 0;
        if(c+1 < COLUMNS && jar[r-1][c+1] == 0 && (c+2 >= COLUMNS || jar[r][c+2] == 0))
          move = 1
        if(c-1 >= 0 && jar[r-1][c-1] == 0 && (c-2 < 0 || jar[r][c-2] == 0))
          move = -1
        if(jar[r][c] && move) {
          jar[r-1][c+move] = jar[r][c];
          jar[r][c] = 0;
          shift = true;
        }
      }
    }
  }
  backup()
}

commitCursor = function() {
  // drop balls
  poses = getCursorDropPos() 
  for(var b=0; b<3; b++){
    pos = poses[b]
    jar[pos[0]][pos[1]] = curr[b]
  }
  // gen next
  curr = next
  next = next.map(_ => (Math.random() * COLORS + 1)>>0)
  // cursor relloc
  cursor = [(COLUMNS+1) / 2, ROWS, 0];
}

drawFrame = function(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMenu(WIDTH-2*MARGIN, MARGIN);

  drawJar(2*MARGIN, HEIGHT-MARGIN);

  drawBalls(2*MARGIN + BALLSIZE/2, HEIGHT-MARGIN - BALLSIZE/2);

  drawCursor(2*MARGIN + BALLSIZE/2, HEIGHT-MARGIN - BALLSIZE/2);
  drawShadow(2*MARGIN + BALLSIZE/2, HEIGHT-MARGIN - BALLSIZE/2);
}


drawMenu = function(origin_x, origin_y) {
  ctx.strokeStyle = "#BBBBBB";
  ctx.lineWidth = BALLSIZE / 30;

  width = 3 * BALLSIZE;
  height = 3 * BALLSIZE;

  ctx.strokeRect(origin_x, origin_y, -width, height);
  draw3Balls(origin_x - width/2, origin_y + height/2, 0, next);
}

drawJar = function(x, y) { // bottomleft
  ctx.strokeStyle = "#BBBBBB";
  ctx.lineWidth = BALLSIZE / 30;

  width = BALLSIZE * (COLUMNS+1) / 2;
  height = BALLSIZE * ((ROWS-1) * SQRT3/2 + 1);

  ctx.strokeRect(x, y, width, -height);
}

drawBalls = function(origin_x, origin_y) { // bottomleft
  for(var r=0; r<ROWS; r++){
    for(var c=0; c<COLUMNS; c++){
      drawBall(origin_x + c * BALLSIZE/2, origin_y - r * BALLSIZE/2 * Math.sqrt(3), jar[r][c]);
    }
  }
}

drawCursor = function(origin_x, origin_y) { // bottomleft
  draw3Balls(origin_x + cursor[0] * BALLSIZE/2, origin_y - cursor[1] * BALLSIZE * SQRT3/2, cursor[2], curr);
}

drawShadow = function(origin_x, origin_y) { // bottemleft
  pos = getCursorDropPos();
  for(var b=0; b<3; b++) {
    drawBall(origin_x + pos[b][1] * BALLSIZE/2, origin_y - pos[b][0] * BALLSIZE * SQRT3/2, curr[b]);
    drawBall(origin_x + pos[b][1] * BALLSIZE/2, origin_y - pos[b][0] * BALLSIZE * SQRT3/2, "rgba(0,0,0,0.5)");
  }
}

draw3Balls = function(center_x, center_y, rotate, color_idxs) {
  upward = [[0, -1 / SQRT3], [-0.5, 0.5 / SQRT3 ], [0.5, 0.5 / SQRT3]]
  downward = [[0.5, -0.5 / SQRT3 ], [-0.5, -0.5 / SQRT3], [0, 1 / SQRT3]]
  pos = rotateArray([upward, downward][rotate%2], (rotate/2)>>0)
  for(var b=0; b<3; b++) {
    drawBall(center_x + BALLSIZE * pos[b][0], center_y + BALLSIZE * pos[b][1], color_idxs[b]);
  }
}

drawBall = function(x, y, color) {
  if(!color)
    return
  if(isInt(color))
    color = colors[color];
  ctx.beginPath();
  ctx.arc(x, y, BALLSIZE/2, 0, 2*Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

isInt = function(data) {
  return data === parseInt(data, 10)
}

showBuffer = function() {
  console.log(BUFF.map(state => state.hash()))
  console.log(BUFF_AT)
}

PRIME = 998244353;

Array.prototype.hash = function() {
  hash_length = 5;

  var buffer = new Array(hash_length).fill(0);
  for(var i=0; i<this.length; i++)
    buffer[i%hash_length] = (buffer[i%hash_length] ^ this[i].hash())
  return parseInt(buffer.map(b => b.toString(10)).join('')) % PRIME
}

Number.prototype.hash = function() {
  return this
}

String.prototype.hash = function() {
  ret = 0;
  for(i=0; i<this.length; i++)
    ret = (ret + this.charCodeAt(i)) % PRIME;
  return ret
}
