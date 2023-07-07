class Creature {
  constructor(x, y, nn = null, gen = 0, parent = null) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    
    this.gen = gen;
    this.parent = parent;
    
    this.brain = (nn) ? nn.copy() : new NeuralNetwork(7, 2, ["posx", "posy", "velx", "vely", "distToFood", "energy", "pheremone", "bias"], ["movex", "movey"]);
    
    this.r = 8;
    this.maxVel = 4;
    
    this.energy = 4;
    
    this.brain.mutate();
  }
  
  reproduce() {
    return new Creature(this.pos.x, this.pos.y, this.brain, this.gen + 1, this);
  }
  
  show() {  
    fill(0);
    if (this.gen == 0) {
      fill(255);
    }
    circle(this.pos.x, this.pos.y, this.r*2);
  }
  
  update() {
    let distance = dist(0, 0, width, height);
    let maxDst = dist(0, 0, width, height);
    
    for (let i of food) {
      const dst = p5.Vector.dist(this.pos, i);
      
      if (dst < this.r + 4) {
        i.set(random(width), random(height));
        this.energy += 2;
        continue;
      }
      
      if (dst < distance) 
        distance = dst;
    }
    
    
      
  
    this.acc.set(0, 0);
    
    let force = this.brain.feedforward([
      this.pos.x / width, this.pos.y / height,
      this.vel.x / this.maxVel, this.vel.y / this.maxVel,
      distance / maxDst, this.energy / 8, 0, 1 // TODO: Pheremone
    ], this.gen > 0);
    
    // if (this.gen > 0) {
    //   print(force);
    // }
    
    this.acc.add(createVector(force[0], force[1]));
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    this.vel.limit(this.maxVel);
    
    this.edges();
    
    this.show();
    
    this.energy -= 0.005;
  }
  
  edges() {
    if (this.pos.x > width + this.r)
      this.pos.x = -this.r;
    if (this.pos.x < -this.r)
      this.pos.x = width + this.r;
    
    if (this.pos.y > height + this.r)
      this.pos.y = -this.r;
    if (this.pos.y < -this.r)
      this.pos.y = height + this.r;
  }
}