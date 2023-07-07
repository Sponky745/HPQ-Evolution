class Creature {
  constructor(x, y, nn = null, gen = 0, parent = null) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(0.0001);
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
    let maxDst = dist(0, 0, width, height);
    
    for (let i of food) {
      const dst = p5.Vector.dist(this.pos, i);
      
      if (dst < this.r + 4) {
        i.set(random(width), random(height));
        this.energy += 1;
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