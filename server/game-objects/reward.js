const {randomInteger} = require('../helpers.js');

class Reward {
  constructor(world, type, x, y) {
    this.world = world;
    this.type = type;
    if (x != undefined && y != undefined) {
      this.x = x;
      this.y = y;
    } else {
      this.respawn(world);
    }
  }

  respawn() {
    // Generate a random x and y position
    this.x = Math.floor(randomInteger(0, this.world.width));
    this.y = Math.floor(randomInteger(0, this.world.height));
    return true;
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
    };
  }
}

module.exports = Reward;
