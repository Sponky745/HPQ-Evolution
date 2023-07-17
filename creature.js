class Creature {
  constructor(x, y, nn = null, gen = 0, parent = null) {
    this.pos            = createVector(x, y);
    this.vel            = p5.Vector.random2D().setMag(0.0001);
    this.acc            = createVector();
    this.gen            = gen;
    this.parent         = parent;
    this.brain          = (nn) ? nn.clone() : new NeuralNetwork(13, 4, ["posx", "posy", "velx", "vely", "angle", "distToFood", "angleToFood", "distToNeighbour", "angleToNeighbour", "energy", "pheromone", "signalrecieved", "bias"], ["turn", "forward", "layDownPheromone", "sendsignal"]);
    this.r              = 8;
    this.maxVel         = 4;
    this.energy         = 4;
    this.score          = 0;
    this.signalStrength = 0;
    this.immortal       = false;
    
    this.brain.mutate();
  }
  
  reproduce() {
    let child = new Creature(this.pos.x, this.pos.y, this.brain, this.gen + 1, this);
    child.score = this.score;
    this.score += 4;
    return child;
  }
  
  show() {  
    fill(255)
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
    
    let closestFood = null;

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
        distance    = dst;
        closestFood = i;
    }

    let dstToClosestNeighbour = dist(0, 0, width, height);
    let closestCreature = null;
    
    for (let i of population) {
      const dst = p5.Vector.dist(this.pos, i.pos);
      
      if (dst < dstToClosestNeighbour && i != this) {
        dstToClosestNeighbour = dst;
        closestCreature       = i;
      }
    }

    let recordStrength = -1;

    for (let i of pheromones) {

      if (p5.Vector.dist(this.pos, i.pos) < this.r + i.r) {
        recordStrength = max(i.strength, recordStrength);
      }
    }

    let angleToClosestNeighbour = (closestCreature == null) ? 0 : p5.Vector.angleBetween(this.vel, p5.Vector.sub(closestCreature.pos, this.pos));
    let angleToClosestFood      = (closestFood     == null) ? 0 : p5.Vector.angleBetween(this.vel, p5.Vector.sub(closestFood        , this.pos));
  
    this.acc.set(0, 0);
    
    let outputs = this.brain.feedforward([
      this.pos.x / width, this.pos.y / height, // position
      this.vel.x / this.maxVel, this.vel.y / this.maxVel, // velocity
      this.vel.heading() / TWO_PI, // angle
      distance / maxDst, // distance to nearest food pellet
      angleToClosestNeighbour / TWO_PI, // angle to nearest food pellet
      angleToClosestFood      / TWO_PI, // angle to nearest creature
      dstToClosestNeighbour   / maxDst, // distance to nearest creature
      this.energy / 8, // energy
      recordStrength, // the strength of the pheromone (if any) that the creature is on
      this.signalStrength,
      1, // bias
    ]);
    
    this.acc = this.vel.copy()
                      .normalize()
                      .mult([outputs[2]]);

    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.vel.rotate(outputs[0]);
    
    this.vel.limit(this.maxVel);
    this.show();
    this.edges();

    if (outputs[3] >= 0.5) {
      pheromones.push(new PheromoneParticle(this.pos.x, this.pos.y, this));
    }
    if (outputs[4] >= 0.8) {
      this.sendSignal(outputs[4]);
    }
    
    this.signalStrength = max(0, this.signalStrength - 0.025);
    this.energy        -= int(!this.immortal) * 0.005;
  }

  sendSignal(strength) {
    let dst = 250 * strength;

    for (let i of creatures) {
      if (p5.Vector.dist(this.pos, i.pos) <= dst && i != this) {
        i.recieveSignal(map(dst, 0, 250, 1, 0));
      }
    }
  }

  recieveSignal(strength) {
    this.signalStrength = strength;
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