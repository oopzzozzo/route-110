var WIDTH = 800;
var HEIGHT = 200;
var stickThickness = 10;
var plateThickness = 20;
var canvas;
var ctx;
var columnWidth;
var hoverX = null;
var select = null;
var level = 5;
var colors = [];
var buttons = [];
var plates = [[], [], []];
var startTime = null;
var recordTime = null;
var revTime = null;
var challengeMode = false;

window.onload = function(){
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = WIDTH;
  ctx.canvas.height = HEIGHT;
  columnWidth = canvas.width / 4;
  canvas.addEventListener('mousemove', updateButtons);
  menu();
};

updateLevel = function(delta){
  level += delta;
  // setcolors
  for(var i=colors.length; i<level; i++){
    var r = 255 * Math.pow(i*3%11/11, 0.5) | 0;
    var g = 255 * Math.pow(1-i*5%13/13, 0.5) | 0;
    var b = 255 * Math.pow((2*255*255-r*r-g*g) / (2*255*255), 0.5) | 0;
    colors[i] = 'rgb(' + r + ', ' + g + ', ' + b;
  }
  // set plates
  plates = [[], [], []];
  for(var i=0; i<level; i++)
    plates[0][i] = level-1 - i;
  drawFrame();
};

menu = function(){
  clearButtons();
  fs = canvas.width / 30 | 0;
  // start
  registerButton({
    f: start,
    l: columnWidth-columnWidth/7-fs*3,
    t: canvas.height*2/3,
    w: fs*3,
    fontsize: fs,
    text: 'Start',
    cHover: 'pink',
    cOff: 'white',
    cText: 'red',
    hover: false
  });
  // lv +-
  fs /= 3;
  var lvUp = {
    f: function(){ updateLevel(1);},
    l: columnWidth*6/7,
    t: canvas.height/3 - fs*2.5,
    w: fs,
    fontsize: fs,
    text: '^',
    cHover: 'pink',
    cOff: 'white',
    cText: 'red',
    hover: false
  };
  var lvDn = Object.assign({}, lvUp);
  lvDn.f = function(){ if(level>1) updateLevel(-1);};
  lvDn.t += fs * 1.5;
  lvDn.text = 'v';
  if(challengeMode){
    drawFrame();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, canvas.height/3 + 5, columnWidth, canvas.height/3 - 10);
    fontsize = canvas.width / 60;
    ctx.font = fontsize + 'pt Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText("You pass Lv." + level + " in " + recordTime + '.', fontsize/2, canvas.height/2-fontsize/2);
    ctx.fillText("But how long would", fontsize/2, canvas.height/2 + fontsize);
    ctx.fillText("        it take to reverse?", fontsize/2, canvas.height/2 + fontsize*2.5);
  }
  else{
    updateLevel(0);
    registerButton(lvUp);
    registerButton(lvDn);
    drawFrame();
  }
}

registerButton = function(btn){
  buttons.push(btn);
}

updateButtons = function(event){
  var pos = getMousePos(event);
  var updateFrame = false;
  for(var i=0; i<buttons.length; i++){
    var btn = buttons[i];
    var origin = btn.hover;
    buttons[i].hover = (pos[0] > btn.l && pos[0] < btn.l+btn.w && pos[1] > btn.t && pos[1] < btn.t+btn.fontsize);
    if(origin != btn.hover){
      drawButton(btn);
      if(origin)
        canvas.removeEventListener('click', btn.f);
      else
        canvas.addEventListener('click', btn.f);
    }
  }
}

drawButton = function(btn){
  // rect
  if(btn.hover)
    ctx.fillStyle = btn.cHover;
  else
    ctx.fillStyle = btn.cOff;
  ctx.fillRect(btn.l, btn.t, btn.w, btn.fontsize*1.1);
  // text
  ctx.font = btn.fontsize + 'pt Arial';
  ctx.fillStyle = btn.cText;
  ctx.fillText(btn.text, btn.l, btn.t+btn.fontsize);
}

clearButtons = function(){
  canvas.removeEventListener('mousemove', updateButtons);
  for(var i=0; i<buttons.length; i++)
    if(buttons[i].hover)
      canvas.removeEventListener('click', buttons[i].f);
  buttons = [];
  canvas.addEventListener('mousemove', updateButtons);
}

start = function(){
  clearButtons();
  if(!challengeMode)
    recordTime = null;
  revTime = null;
  startTime = new Date().getTime();
  canvas.addEventListener('click', onMouseClick);
  canvas.addEventListener('mousemove', onMouseMove);
  drawFrame();
}

challenge = function(){
  if(challengeMode == false && plates[2].length == level){
    recordTime = (new Date().getTime() - startTime) / 1000 | 0;
    recordTime = ('00'+(recordTime/60%60|0)).slice(-2) + ':' + (('00'+(recordTime%60|0)).slice(-2));
    challengeMode = true;
    startTime = null;
    canvas.removeEventListener('click', onMouseClick);
    canvas.removeEventListener('mousemove', onMouseMove);
    menu();
  }
  else if(challengeMode == true && plates[0].length == level){
    revTime = (new Date().getTime() - startTime) / 1000 | 0;
    revTime = ('00'+(revTime/60%60|0)).slice(-2) + ':' + (('00'+(revTime%60|0)).slice(-2));
    challengeMode = false;
    startTime = null;
    canvas.removeEventListener('click', onMouseClick);
    canvas.removeEventListener('mousemove', onMouseMove);
    menu();
  }
}

drawFrame = function(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // info
  var fontsize = canvas.width/30 | 0;
  ctx.font = fontsize + 'pt Arial';
  ctx.fillStyle = 'white';
  ctx.fillText("Level"+("   "+level).slice(-4), columnWidth/7, canvas.height/3);
  buttons.forEach(drawButton);
  if(recordTime != null){
    fontsize /= 2;
    ctx.font = fontsize + 'pt Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText("last record: " + recordTime, columnWidth/2-fontsize*5, canvas.height/2+fontsize/2);
  }
  if(revTime != null){
    fontsize = canvas.width / 60;
    ctx.font = fontsize + 'pt Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText("reverse:      " + revTime, columnWidth/2-fontsize*5, canvas.height/2+fontsize*2);
  }
  // plates
  var xs = [canvas.width * 3/8, canvas.width * 5/8, canvas.width * 7/8];
  for(var i=0; i<3; i++){
    ctx.fillStyle = 'brown';
    ctx.fillRect(xs[i] - stickThickness/2, canvas.height - plateThickness*(level+1), stickThickness, plateThickness*(level+1));
    ctx.fillRect(xs[i] - stickThickness*(level+2), canvas.height - plateThickness/2, stickThickness*(level+2)*2, plateThickness/2);
    for(var j=0; j<plates[i].length; j++){
      var plateNo = plates[i][j];
      if(select == i && j == plates[i].length-1)
        ctx.fillStyle = colors[plateNo] + ", 0.5)";
      else
        ctx.fillStyle = colors[plateNo] + ")";
      ctx.fillRect(xs[i] - stickThickness*(plateNo+1), canvas.height - plateThickness*(j+1.5), stickThickness*(plateNo+1)*2, plateThickness);
    }
  }
  // mouse
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(hoverX, 0, columnWidth, canvas.height);
  // mask
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  if(startTime != null)
    ctx.fillRect(0, 0, columnWidth, canvas.height);
  else
    ctx.fillRect(columnWidth, 0, canvas.width-columnWidth, canvas.height);
}

onMouseClick = function(event){
  var idx = (getMousePos(event)[0] / columnWidth | 0) - 1;
  if(idx < 0) return;
  if(select == null && plates[idx].length)
    select = idx;
  else if(select != null && (!plates[idx].length || plates[idx][plates[idx].length-1] > plates[select][plates[select].length-1])){
    plates[idx].push(plates[select].pop());
    select = null;
  }
  else
    select = null;
  drawFrame();
  if(plates[0].length == level || plates[2].length == level)
    challenge();
}

onMouseMove = function(event){
  var curr = getMousePos(event)[0];
  curr -= curr % columnWidth;
  if(curr != hoverX){
    hoverX = curr;
    drawFrame(true);
  }
}

getMousePos = function(event){
  var rect = canvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}
