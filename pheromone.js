class PheromoneParticle {
  constructor(x, y, creator) {
    this.pos      = createVector(x, y);
    this.creator  = creator;
    this.strength = 1;
    this.r        = 12;
  }

  show() {
    fill(255, 0, 0, this.strength*255);
    circle(this.pos.x, this.pos.y, this.r*2);
  }

  update() {
    this.strength -= 0.005;
  }
}