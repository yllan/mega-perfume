var MegaMan = function(json, tileSize, scale) {
  var LEFT_KEY = 37,
      RIGHT_KEY = 39,
      SPACE_KEY = 32,
      DEFAULT_CASE = 99999;
  var LEFT = false, RIGHT = true;
  var _this = this;

  this.TILE_SIZE = tileSize;
  this.SCALE = scale;

  this.w = json.w;
  this.h = json.h;
  this.sprites = json.sprites;

  this.idle = 0;
  this.x = 0;
  this.y = 0;
  this.status = "";
  this.right = true;
  this.images = {}; // name to image hash

  this.frames = 0;
  this.jumpVelocityIndex = 0;
  this.jumpEnergy = 0;

  this.jumpSound;

  this.preload = function () {
    this.jumpSound = document.createElement("audio");
    this.jumpSound.src = "jump.mp3";
    this.jumpSound.preload = "auto";
    this.jumpSound.load();
    this.jumpSound.volume = 0.0001;
    this.jumpSound.play();

    this.images = {};
    for (var k in this.sprites) {
      var img = new Image();
      img.src = this.sprites[k].image;
      this.images[k] = img;
    }
  };

  this.draw = function(ctx, offsetX) {
    var x = this.x - offsetX;
    var s = this.sprites[this.status]
    ctx.save();
    if (!this.right) {
      ctx.translate(x + this.SCALE * (s.mass.length + s.mass.location), this.y - this.h * this.SCALE);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x - this.SCALE * s.mass.location, this.y - this.h * this.SCALE);
    }
    ctx.drawImage(this.images[this.status], 0, 0, this.w * this.SCALE, this.h * this.SCALE);
    ctx.restore();
  };

  this.moveLeft = function(stage, distance) {
    distance = typeof distance !== 'undefined' ? distance : 6;
    _this.x = Math.max(0, _this.x - distance);
  };

  this.moveRight = function(stage, distance) {
    distance = typeof distance !== 'undefined' ? distance : 6;
    _this.x = Math.min(stage.pixelWidth(), _this.x + distance);
  };

  this.goStand = function () {
    _this.idle = 0;
    _this.status = "stand";
    _this.frames = 0;
  }

  this.goBlink = function () {
    _this.idle = 0;
    _this.status = "blink";
    _this.frames = 10;
  };

  this.goMove = function (facing) {
    _this.clearIdle();
    _this.right = facing;
    _this.status = "move";
    _this.frames = 15;
  };

  this.moving = function (facing, stage) {
    _this.right = facing;
    if (_this.frames < 9) {
      if (facing == RIGHT) {
        _this.moveRight(stage, 2);
      } else {
        _this.moveLeft(stage, 2);
      }
    }
    if (!_this.goFallingIfShould(stage)) {
      if (_this.frames == 0) {
        _this.goRun("run-1");
      }
    }
  }

  this.clearIdle = function () {
    _this.idle = 0;
  };

  this.canFall = function (stage) {
    var gridX = Math.floor(_this.x / (_this.SCALE * _this.TILE_SIZE)),
    gridY = Math.floor(_this.y / (_this.SCALE * _this.TILE_SIZE));

    if (stage.isSolid(gridX, gridY)) {
      return false;
    }
    return true;
  };

  this.goFallingIfShould = function (stage) {
    if (_this.canFall(stage)) {
      _this.y += 6 * _this.SCALE;
      _this.status = "jump";
      _this.jumpEnergy = 0;
      _this.jumpVelocityIndex = jumpingStaticIndex;
      _this.frames = 0;
      return true;
    }
    return false;
  };

  var jumpingVelocity = [
    10, 
    8, 
    4,
    2, 
    1,
    0, 
    -1,
    -2,
    -4,
    -8,
    -10];
  var jumpingStaticIndex = Math.floor(jumpingVelocity.length / 2);

  this.goJump = function () {
    _this.jumpEnergy = 2;
    _this.jumpVelocityIndex = 0;
    _this.frames = 0;
    _this.status = "jump"
  };

  this.goPreJump = function () {
    _this.frames = 2;
    _this.status = "prejump";
  };

  this.goLanding = function () {
    _this.frames = 2;
    _this.status = "landing";
    _this.jumpSound.volume = 1;
    _this.jumpSound.play();
  };

  this.goRun = function(nextStep) {
    _this.status = nextStep;
    _this.frames = 10;
  }

  this.runForNextStep = function(nextStep) {
    return function(stage, keyboard) {
      if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) {
        _this.right = keyboard[RIGHT_KEY];
        if (_this.right) 
          _this.moveRight(stage);
        else 
          _this.moveLeft(stage);
        _this.frames--;
        if (_this.goFallingIfShould(stage)) {
          return;
        }
        if (_this.frames <= 0) {
          _this.goRun(nextStep);
        }
        if (keyboard[SPACE_KEY]) 
          _this.goJump();
      } else {
        _this.goStand();
      }
    };
  };

  this.transitions = {
    "stand" : function(stage, keyboard) {
      _this.idle++;

      if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) { // only one happened.
        _this.goMove(keyboard[RIGHT_KEY]);
      }

      /* should be move out to on key down */
      if (keyboard[SPACE_KEY]) {
        _this.clearIdle();
        _this.goPreJump();
        return;
      } 
      
      if (!_this.goFallingIfShould(stage)) {
        if (_this.idle > 30 * 10) 
          _this.goBlink();
      }
    },

    "blink" : function(stage, keyboard) {
      _this.frames--;
      if (_this.frames <= 0) {
        _this.status = "stand";
        _this.frames = 0;
        _this.clearIdle();
        return;
      }

      if (keyboard[LEFT_KEY] || keyboard[RIGHT_KEY]) {
        _this.clearIdle();
        if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) { // only one happened.
          _this.goMove(keyboard[RIGHT_KEY]);
          return;
        }
      }
    },

    "move" : function(stage, keyboard) {
      _this.frames--;

      if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) { // only one happened.
        _this.moving(keyboard[RIGHT_KEY], stage);
        if (keyboard[SPACE_KEY])
          _this.goPreJump();
        return;
      }

      if (keyboard[SPACE_KEY]) {
        _this.goPreJump();
      } else {
        _this.goStand();
      }
    },
    "prejump": function (stage, keyboard) {
      if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) { // only one happened.
        _this.right = keyboard[RIGHT_KEY];
        if (_this.right) 
          _this.moveRight(stage); 
        else 
          _this.moveLeft(stage);
      }

      if (_this.frames == 0) {
        _this.y += 6 * _this.SCALE;
        _this.goJump();
      } else if (_this.frames == 2) {
        _this.y -= 6 * _this.SCALE;
      }
      _this.frames--;
    },
    "jump": function(stage, keyboard) {
      if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) { // only one happened.
        _this.right = keyboard[RIGHT_KEY];
        if (_this.right) 
          _this.moveRight(stage); 
        else 
          _this.moveLeft(stage);
      }

      if (keyboard[SPACE_KEY]) {
        if (_this.jumpVelocityIndex <= 1 && _this.jumpEnergy > 0 && _this.frames < 12) {
          _this.jumpEnergy += 1;
          _this.jumpingVelocity = 0;
        }
      }

       _this.frames++;

      _this.y -= jumpingVelocity[_this.jumpVelocityIndex];
      if (_this.jumpVelocityIndex < jumpingStaticIndex) { // up
        /* TODO: test if we can go up */
      } else { // down
        if (!_this.canFall(stage)) {
          _this.y = Math.floor(_this.y / (_this.SCALE * _this.TILE_SIZE)) * (_this.SCALE * _this.TILE_SIZE);
          _this.goLanding();
        }
      }

      /* velocity transition */
      if (_this.jumpEnergy > 0) {
        _this.jumpEnergy--;
        // _this.jumpVelocityIndex = 0;
      } else if (_this.jumpVelocityIndex < jumpingVelocity.length - 1) {
        _this.jumpVelocityIndex++;
      }
    },
    "landing": function (stage, keyboard) {
      if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) { // only one happened.
        _this.right = keyboard[RIGHT_KEY];
        if (_this.right) 
          _this.moveRight(stage); 
        else 
          _this.moveLeft(stage);
      }

      if (_this.frames == 0) {
        _this.y -= 6 * _this.SCALE;
        if (keyboard[LEFT_KEY] ^ keyboard[RIGHT_KEY]) {
          _this.goRun("run-1");
        } else {
          _this.goStand();
        }
      } else if (_this.frames == 2) {
        _this.y += 6 * _this.SCALE;
      }
      _this.frames--;
    },
    "run-1": this.runForNextStep("run-2"),
    "run-2": this.runForNextStep("run-3"),
    "run-3": this.runForNextStep("run-4"),
    "run-4": this.runForNextStep("run-1")
  };
}