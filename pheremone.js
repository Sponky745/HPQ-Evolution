class PheremoneParticle {
  constructor(x, y, creator) {
    this.pos = createVector(x, y);
    this.creator = creator;
    this.strength = 1;
  }

  update() {
    this.strength -= 0.005;
  }
}