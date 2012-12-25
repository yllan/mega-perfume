

var SCREEN_WIDTH = 960,
    SCREEN_HEIGHT = 720,
    tileSize = 16,
    scale = 3;

var screenContext, offscreenCanvas;


window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function (callback) {
            window.setTimeout(callback, 1000 / 30);
          };
})();

var mega = new MegaMan(ksyk, tileSize, scale);
var stage = new Stage(hiroshima, tileSize, scale);
var keyboard = {};

mega.preload();
stage.preload();

function attachEvent(node, name, func) {
  if (node.addEventListener) {
    node.addEventListener(name, func, false);
  } else if (node.attachEvent) {
    node.attachEvent(name, func);
  }
};

attachEvent(document, "keydown", function(e) {
  keyboard[e.keyCode] = true;
});

attachEvent(document, "keyup", function(e) {
  keyboard[e.keyCode] = false;
});


function render() {
  requestAnimFrame(render);

  // decide the scene shift
  var offsetX = Math.floor(Math.min(stage.pixelWidth() - SCREEN_WIDTH, Math.max(0, mega.x - SCREEN_WIDTH / 2)));
  screenContext.drawImage(offscreenCanvas, offsetX, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  var tf = mega.transitions[mega.status];
  tf(stage, keyboard);
  // console.log(mega.status);

  mega.draw(screenContext, offsetX); 
}

window.onload = function() {
  var pixellate = function(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
  }
  screenContext = document.getElementById("screen").getContext("2d");
  pixellate(screenContext);

  offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = stage.pixelWidth();
  offscreenCanvas.height = stage.pixelHeight();

  pixellate(offscreenCanvas.getContext("2d"));

  stage.render(offscreenCanvas.getContext("2d"));

  mega.x = 100;
  mega.y = 400;
  mega.status = "stand";
  render();
}