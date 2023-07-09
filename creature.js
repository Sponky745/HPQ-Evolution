class Creature {
  constructor(x, y, nn = null, gen = 0, parent = null) {
    this.pos    = createVector(x, y);
    this.vel    = p5.Vector.random2D().mult(0.0001);
    this.acc    = createVector();
    this.gen    = gen;
    this.parent = parent;
    this.brain  = (nn) ? nn.clone() : new NeuralNetwork(8, 3, ["posx", "posy", "velx", "vely", "angle", "distToFood", "energy", "pheremone", "bias"], ["turnleft", "turnright", "forward"]);
    this.r      = 8;
    this.maxVel = 4;
    this.energy = 4;
    this.score  = 0;
    
    this.brain.mutate();
  }
  
  reproduce() {
    let child = new Creature(this.pos.x, this.pos.y, this.brain, this.gen + 1, this);
    child.vel = this.vel.copy();
    child.score = this.score + 4;
    return child;
  }
  
  show() {  
    fill(0, 255, 0);
    if (this.gen == 0) {
      fill(255);
    }
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI);

    beginShape();
    vertex(0, -this.r * 1.5);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);

    pop();
  }
  
  update() {
    let distance = dist(0, 0, width, height);
    let maxDst   = dist(0, 0, width, height);
    
    for (let i of food) {
      const dst = p5.Vector.dist(this.pos, i);
      
      if (dst < this.r + 7) {
        i.set(random(width), random(height));
        const energyGained = random(2, 2.5);
        this.energy += energyGained;
        this.score  += energyGained;
        continue;
      }
      
      if (dst < distance) 
        distance = dst;
    }
  
    this.acc.set(0, 0);
    
    let force = this.brain.feedforward([
      this.pos.x / width, this.pos.y / height, // position
      this.vel.x / this.maxVel, this.vel.y / this.maxVel, // velocity
      this.vel.heading() / TWO_PI, // angle
      distance / maxDst, // distance to nearest food pellet
      this.energy / 8, // energy
      0, // TODO: Pheremone
      1 // bias
    ]);
    
    this.acc = p5.Vector.fromAngle(this.vel.heading() - force[0] + force[1]).mult(force[2]);
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.vel.rotate(force[1] - force[0]);
    
    this.vel.limit(this.maxVel);
    this.show();
    this.edges();
    
    
    this.energy -= 0.005;
  }
  
  edges() {
    if (this.pos.x > width/2 * 6 + this.r)
        this.pos.x = -width/2 * 6 - this.r;
    if (this.pos.x < -width/2 * 6 - this.r)
        this.pos.x = width/2 * 6 + this.r;
    
    if (this.pos.y > height/2 * 6 + this.r)
        this.pos.y = -height/2 * 6 - this.r;
    if (this.pos.y < -height/2 * 6 - this.r)
        this.pos.y = height/2 * 6 + this.r;
  }
}