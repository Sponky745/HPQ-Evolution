class Creature {
  constructor(x, y, nn = null, gen = 0, parent = null) {
    this.pos    = createVector(x, y);
    this.vel    = p5.Vector.random2D().mult(0.0001);
    this.acc    = createVector();
    this.gen    = gen;
    this.parent = parent;
    this.brain  = (nn) ? nn.clone() : new NeuralNetwork(9, 4, ["posx", "posy", "velx", "vely", "angle", "distToFood", "distToNeighbour", "energy", "pheremone", "bias"], ["turnleft", "turnright", "forward", "layDownPheremone"]);
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

    let dstToClosestNeighbour = dist(0, 0, width, height);
    
    for (let i of population) {
      const dst = p5.Vector.dist(this.pos, i.pos);
      
      if (dst < dstToClosestNeighbour) 
        dstToClosestNeighbour = dst;
    }

    let recordStrength = -1;

    for (let i of pheremones) {
      recordStrength = max(i.strength, recordStrength);
    }
  
    this.acc.set(0, 0);
    
    let outputs = this.brain.feedforward([
      this.pos.x / width, this.pos.y / height, // position
      this.vel.x / this.maxVel, this.vel.y / this.maxVel, // velocity
      this.vel.heading() / TWO_PI, // angle
      distance / maxDst, // distance to nearest food pellet
      dstToClosestNeighbour / maxDst, // distance to nearest creature
      this.energy / 8, // energy
      recordStrength, // pheremone
      1 // bias
    ]);
    
    this.acc = p5.Vector.fromAngle(this.vel.heading() - outputs[0] + outputs[1]).mult(outputs[2]);
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.vel.rotate(outputs[1] - outputs[0]);
    
    this.vel.limit(this.maxVel);
    this.show();
    this.edges();

    if (outputs[3] >= 0.5) {
      pheremones.push(new PheremoneParticle(this.pos.x, this.pos.y, this));
    }
    
    
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