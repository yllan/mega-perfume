
var canvas;
var stage = hiroshima;
var mega = ksyk;
var SCREEN_WIDTH = 960;
var SCREEN_HEIGHT = 720;
var keyboard = {};
var LEFT_KEY = 37;
var RIGHT_KEY = 39;

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

/* left-bottom corner */
mega.x = 100;
mega.y = 0;
mega.status = "jump";
mega.left = false;

mega.preload = function() {
  this.images = {};
  for (var k in this.sprites) {
    var img = new Image();
    img.src = this.sprites[k].image;
    this.images[k] = img;
  }
};


mega.draw = function(ctx, offsetX) {
  var x = this.x - offsetX;
  var s = this.sprites[this.status]
  ctx.save();
  if (this.left) {
    ctx.translate(x + SCALE * (s.mass.length + s.mass.location), this.y - this.h * SCALE);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x - SCALE * s.mass.location, this.y - this.h * SCALE);
  }
  ctx.drawImage(this.images[this.status], 0, 0, this.w * SCALE, this.h * SCALE);
  ctx.restore();
}

mega.moveLeft = function(s) {
  this.x = Math.max(0, this.x - 5);
}

mega.moveRight = function(s) {
  this.x = Math.min(s.w * TILE_SIZE * SCALE, this.x + 5);
}

mega.update = function(s) {
  if (this.status == "jump") {
    if (keyboard[LEFT_KEY]) {
      this.left = true;
      this.moveLeft(s);
    } else if (keyboard[RIGHT_KEY]) {
      this.left = false;
      this.moveRight(s);
    }

    this.y += 8;
    var gridX = Math.floor(this.x / (SCALE * TILE_SIZE))
    var gridY = Math.floor(this.y / (SCALE * TILE_SIZE));
    var t = s.map[gridY][gridX];
    // console.log("(" + this.x + ", " + this.y + "): @[" + gridY + "][" + gridX + "]=" + t);
    if (s.tiles[t].solid) {
      this.y = Math.floor(this.y / (SCALE * TILE_SIZE)) * (SCALE * TILE_SIZE);
      this.status = "stand";
    }
  } else if (this.status == "stand") {
    if (keyboard[LEFT_KEY]) {
      this.left = true;
      this.moveLeft(s);
    } else if (keyboard[RIGHT_KEY]) {
      this.left = false;
      this.moveRight(s);
    }
  }
}

var SCALE = 3;
var TILE_SIZE = 16;
var map;
var tileImages = {}

for (var k in stage["tiles"]) {
  var img = new Image();
  img.src = stage["tiles"][k]["image"]; // preload
  tileImages[k] = img;
}
mega.preload();

function render() {
  requestAnimFrame(render);

  // decide the scene shift
  var offsetX = Math.floor(Math.max(0, mega.x - SCREEN_WIDTH / 2));
  canvas.drawImage(map, offsetX, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  mega.update(stage);
  mega.draw(canvas, offsetX); 
}

function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};

attachEvent(document, "keydown", function(e) {
  keyboard[e.keyCode] = true;
});

attachEvent(document, "keyup", function(e) {
  keyboard[e.keyCode] = false;
});

window.onload = function() {
  canvas = document.getElementById("screen").getContext("2d");
  canvas.imageSmoothingEnabled = false;
  canvas.webkitImageSmoothingEnabled = false;
  canvas.mozImageSmoothingEnabled = false;
  canvas.oImageSmoothingEnabled = false;

  map = document.createElement('canvas');
  map.width = SCALE * TILE_SIZE * stage.w;
  map.height = SCALE * TILE_SIZE * stage.h;
  console.log(map.height);

  var ctx = map.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.oImageSmoothingEnabled = false;

  for (var y = 0; y < stage.h; y++) {
    for (var x = 0; x < stage.w; x++) {
      var k = stage["map"][y][x];
      ctx.drawImage(tileImages[k], SCALE * TILE_SIZE * x, SCALE * TILE_SIZE *y, SCALE * TILE_SIZE, SCALE * TILE_SIZE);
    }
  }

  render();
}