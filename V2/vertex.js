class Vertex {
  constructor(id, x, y, layer) {
    this.pos            = createVector(x, y);
    this.vel            = createVector();
    this.acc            = createVector();
    this.id             = id;
    this.layer          = layer;
    this.targets        = [];
    this.outputEdges    = [];
    this.output         = 0;
    this.inputFunc      = ()=>1;
    this.activationFunc = random(Vertex.activationFuncs);
    this.inputs         = [];
    this.r              = 2;

    if (this.layer == -1) {
      this.inputFunc = random(Vertex.inputs);
    }
  }

  edgeCollision() {
    if (this.pos.x > worldWidth/2 - this.r) {
      this.pos.x = worldWidth/2 - this.r;
      this.vel.x *= -1;
    }
    else if (this.pos.x < -worldWidth/2 + this.r) {
      this.pos.x = -worldWidth/2 + this.r;
      this.vel.x *= -1;
    }

    if (this.pos.y > worldHeight/2 - this.r) {
      this.pos.y = worldHeight/2 - this.r;
      this.vel.y *= -1;
    }
    else if (this.pos.y < -worldHeight/2 + this.r) {
      this.pos.y = -worldHeight/2 + this.r;
      this.vel.y *= -1;
    }
  }

  activate() {
    // if (frameCount % 30 != 0) return;
    for (let i of this.targets) {
      i.restLength = i.originalRestLength * this.output;
    }
  }

  clear() {
    this.inputs = [];
    this.output = 0;
  }

  disconnect() {
    this.outputEdges = [];
  }

  engage() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.output += this.inputs[i];
    }

    // this.output = this.activationFunc(this.output);
    for (let i of this.outputEdges) {
      i.feedforward(this.output);
    }
  }

  addInput(input) {
    this.inputs.push(input);
  }

  getInput(x, y) {
    // this.inputs.push(Vertex.inputsToFunc[this.inputFunc]);
    this.inputs.push(random(1));
  }
  
  show() {
    strokeWeight(2);
    stroke(255, 255, 0);
    for (let i of this.targets) {
      let mid = i.midpoint();
      line(this.pos.x, this.pos.y, mid.x, mid.y);
    }
    strokeWeight(1);
    stroke(0);
    fill((this.layer == -1) ? 255 : (this.layer < Number.MAX_SAFE_INTEGER) ? 128 : 0);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(8);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.vel.mult(0.95);
  }

  osfa() {
    this.update();
    this.show();
  }

  clone() {
    let newOne = new Vertex(this.id, this.pos.x, this.pos.y, this.layer);

    newOne.inputFunc = this.inputFunc;
    newOne.activationFunc = this.activationFunc;

    return newOne;
  }
}

//TODO: INPUTS TO FUNC

Vertex.inputs = [
  "distToNearestCreature",
  "angleToNearestCreature",
  "distToNearestFood",
  "angleToNearestFood",
  "posx",
  "posy",
  "velx",
  "vely",
  "dir" ,
];

Vertex.inputsToFunc = {
  distToNearestCreature: (x, y) => {
    let record = Infinity;

    for (let i of creatures) {
      let dst = dist(x, y, i.pos.x, i.pos.y);
      if (dst == 0) continue;
      record = min(record, dst);
    }

    return record / dist(0, 0, width, height);
  },
  angleToNearestCreature: (x, y) => {
    let creature = null;
    let record   = Infinity;

    for (let i of creatures) {
      let dst = dist(x, y, i.pos.x, i.pos.y);

      if (dst == 0) continue;

      if (dst < record) {
        creature = i;
        record = dst;
      }
    }


    let pos      = createVector(x, y);
    let otherPos = creature.pos.copy().sub(pos).normalize();

    return otherPos.angleBetween(createVector(0, -1));
  },
  distToNearestFood: (x, y) => {
    let record = Infinity;

    for (let i of food) {
      let dst = dist(x, y, i.x, i.y);
      if (dst == 0) continue;
      record = min(record, dst);
    }

    return record / dist(0, 0, width, height);
  },
  angleToNearestFood: (x, y) => {
    let food     = null;
    let record   = Infinity;

    for (let i of food) {
      let dst = dist(x, y, i.x, i.y);

      if (dst == 0) continue;

      if (dst < record) {
        food   = i;
        record = dst;
      }
    }


    let pos      = createVector(x, y);
    let otherPos = food.copy().sub(pos).normalize();

    return otherPos.angleBetween(createVector(0, -1));
  },
  posx: (x, y) => x,
  posy: (x, y) => y,
  velx: (x, y) => x,
  vely: (x, y) => y,
  dir : (x, y) => createVector(x, y).heading(),
};

Vertex.activationFuncs = [
  (x) => Math.tanh(x),
  (x) => Math.sin(x),
  (x) => Math.cos(x),
  (x) => Math.max(x, 0),
  (x) => Math.min(max(x, 0)),
  (x) => Math.exp(x*x),
  (x) => 1 / (1 + Math.exp(-x)),
  (x) => Math.max(0.1*x, x),
  (x) => (x >= 0) ? x : (Math.exp(x) - 1),
];