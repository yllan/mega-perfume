var Stage = function (json, tileSize, scale) {
  
  this.TILE_SIZE = tileSize;
  this.SCALE = scale;
  this.w = json.w;
  this.h = json.h;

  /* 
    Hash: 
    Char -> {
              "solid": Boolean, 
              "image": String
            }
   */
  this.tiles = json.tiles;
  this.map = json.map;
  this.tileImages = {};

  this.pixelWidth = function () { return this.w * this.TILE_SIZE * this.SCALE; };
  this.pixelHeight = function () { return this.h * this.TILE_SIZE * this.SCALE; };

  this.preload = function () {
    this.tileImages = {};
    for (var k in this.tiles) {
      var img = new Image();
      img.src = this.tiles[k].image;
      this.tileImages[k] = img;
    }
  };

  this.render = function (ctx) {
    for (var y = 0; y < stage.h; y++) {
      for (var x = 0; x < stage.w; x++) {
        var charCode = this.map[y][x];
        ctx.drawImage(this.tileImages[charCode], this.SCALE * this.TILE_SIZE * x, this.SCALE * this.TILE_SIZE * y, this.SCALE * this.TILE_SIZE, this.SCALE * this.TILE_SIZE);
      }
    }
  };

  this.isSolid = function (x, y) {
    return this.tiles[this.map[y][x]].solid;
  }
}