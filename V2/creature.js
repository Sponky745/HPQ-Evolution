class Creature {
  constructor(x, y) {
    this.vertices    = [];
    this.edges       = [];
    this.pos         = createVector(x, y);
    this.numI        = 0;
    this.numO        = 0;
    this.nextVertice = 0;
    this.nextEdge    = 0;
    this.energy      = 4;
    this.dir         = createVector();

    for (let i = 0; i < Creature.STARTING_SIZE; i++) {
      this.vertices.push(new Vertex(this.nextVertice, 
        random(-25, 25) + this.pos.x,
        random(-25, 25) + this.pos.y,
        (i == 0) ? -1 : (i != Creature.STARTING_SIZE-1) ? i : Number.MAX_SAFE_INTEGER
      ));

      if (this.vertices[this.vertices.length-1].layer == -1) {
        this.numI++;
      }
      else if (this.vertices[this.vertices.length-1].layer == Number.MAX_SAFE_INTEGER) {
        this.numO++;
      }

      this.nextVertice++;
    }

    for (let i = 0; i < this.vertices.length; i++) {
      for (let j = i+1; j < this.vertices.length; j++) {
        if (this.vertices[i].layer == Number.MAX_SAFE_INTEGER || 
            this.vertices[j].layer == -1 ||
            this.vertices[i].layer == this.vertices[j].layer ||
            this.vertices[i].layer > this.vertices[j].layer ||
            this.edgeAlreadyExists(this.vertices[i], this.vertices[j])) continue;
        
        this.edges.push(new Edge(this.vertices[i], this.vertices[j], random(0.2, 1), this.nextEdge));
        this.vertices[i].outputEdges.push(this.edges[this.edges.length-1]);
        this.nextEdge++;
      }
    }

    this.connect();

    for (let i = this.vertices.length-this.numO; i < this.vertices.length; i++) {
      let vert = this.getVertexById(i);
      vert.targets.push(random(this.edges));
      // vert.targets.push(random(this.edges));
    }
  }

  connect() {
    for (let i of this.vertices) {
      i.disconnect();
    }

    for (let i of this.edges) {
      i.in.outputEdges.push(i);
    }
  }

  sort() {
    let layers = [];
    let newVertices = [];

    for (let i = 0; i < this.vertices.length; i++) {
      let unique = false;
      for (let j = 0; j < layers.length; j++) {
        if (this.vertices[j].layer == layers[j][0].layer) {
          layers[j].push(this.vertices[i]);
          unique = false;
        }
      }
      if (unique) {
        layers.push([ this.vertices[i] ]);
      }
    }

    layers.sort((a, b) => a[0].layer - b[0].layer);

    for (let i = 0; i < layers.length; i++) {
      for (let j = 0; j < layers[i].length; j++) {
        newVertices.push(layers[i][j]);
      }
    }
  }

  getVertexById(id) {
    for (let i of this.vertices) {
      if (i.id == id) {
        return i;
      }
    }
  }

  getEdgeById(id) {
    for (let i of this.edges) {
      if (i.id == id) {
        return i;
      } 
    }

    return false;
  }

  edgeCollision() {
    for (let i of this.vertices) {
      i.edgeCollision();
    }
  }

  show() {
    for (let i of this.edges) {
      i.show();
    }

    for (let i of this.vertices) {
      i.show();
    }
  }

  update(frameRule) {
    if (frameCount % frameRule == 0) {
      this.sort();

      let vel = createVector();

      for (let i of this.vertices) {
        i.clear();
        vel.add(i.vel);
      }

      vel.div(this.vertices.length);

      // print(vel.mag());

      for (let i = 0; i < this.numI; i++) {
        switch (i.inputFunc) {
          case "dir":
            this.vertices[i].getInput(     vel.x,      vel.y);
            break;
          case "vel":
            this.vertices[i].getInput(     vel.mag()        );
          default:
            this.vertices[i].getInput(this.pos.x, this.pos.y);
            break;
        }
      }

      for (let i of this.vertices) {
        i.engage();
      }

      for (let i = this.vertices.length-this.numO; i < this.vertices.length; i++) {
        this.vertices[i].activate();
      }
    }

    for (let i of this.edges) {
      i.update();
    }

    let sum = createVector();
    this.dir.mult(0);

    for (let i of this.vertices) {
      i.update();
      sum.add(i.pos);
      this.dir.add(i.vel.heading());

      for (let j of food) {
        if (p5.Vector.dist(i.pos, j) <= i.r + 2) {
          this.energy += random(-0.5, 2);
          j.set(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2));
        }
      }
    }

    this.dir.div(this.vertices.length);

    this.pos = p5.Vector.div(sum, this.vertices.length);
    this.energy -= 0.0025;
  }

  osfa(frameRule) {
    this.edgeCollision();
    this.update(frameRule);
    this.show();
  }

  edgeAlreadyExists(a, b) {
    for (let i of this.edges) {
      if (i.a == a.id && i.b == b.id && i.weight != 0 && i.a == b.id && i.b == a.id) {
        return true;
      }
    }

    return false; 
  }

  clone() {
    let newOne = new Creature(this.pos.x, this.pos.y);

    newOne.vertices=[];newOne.edges=[];newOne.nextVertice=this.nextVertice;newOne.numI=this.numI;newOne.numO=this.numO; 

    let randomOffset = p5.Vector.random2D().mult(50);

    for (let i = 0; i < this.vertices.length; i++) {
      newOne.vertices[i] = this.vertices[i].clone();
      newOne.vertices[i].pos.add(randomOffset);
    }

    for (let i = 0; i < this.edges.length; i++) {
      newOne.edges[i] = this.edges[i].clone(newOne.getVertexById(this.edges[i].a), newOne.getVertexById(this.edges[i].b));
    }

    for (let i = 0; i < newOne.vertices.length; i++) {
      for (let j = 0; j < this.vertices[i].targets.length; j++) {
        newOne.vertices[i].targets[j] = newOne.getEdgeById(this.vertices[i].targets[j].id);
      }
    }

    newOne.connect();

    return newOne;
  }

  // ------------------------------------------ MUTATION METHODS ------------------------------------------------------------------------------------------

  addVert() {
    let edge = random(this.edges);

    while (edge.weight == 0) {
      edge = random(this.edges);
    }

    let newVert = new Vertex(this.nextVertice, random(-20, 20) + this.pos.x, random(-20, 20) + this.pos.y, edge.in.layer+1);
    this.nextVertice++;

    let aToNew = new Edge(edge.in, newVert , edge.weight, this.nextEdge);
    let newToB = new Edge(newVert, edge.out, edge.weight, this.nextEdge);

    this.nextEdge += 2;

    this.vertices.push(newVert);
    this.edges   .push(aToNew, newToB);

    edge.weight = 0;
    this.connect();
  }

  addEdge() {
    let a = random(this.vertices);
    let b = random(this.vertices);

    let maxIterations = 150;
    let i = 0;

    let reason = "";
    
    while ( (a.layer == b.layer || a.layer > b.layer || this.edgeAlreadyExists(a, b)) && i < maxIterations) {
      if (a.layer == b.layer) {
        reason = "A is in the same layer as B";
      }
      if (a.layer > b.layer) {
        reason = "A is past B";
      }
      if (this.edgeAlreadyExists(a, b)) {
        reason = "Already there";
      }

      a = random(this.vertices);
      b = random(this.vertices);
      i++;
    }

    if (i < maxIterations) {
      this.edges.push(new Edge(a, b, random(0.2, 1), this.nextEdge));
      this.nextEdge++;
    }
    else {
      // console.log(`addEdge: No valid edge possible: ${reason}`);
      // console.log(`From ${a.id} to ${b.id}`);
    }

    this.connect();
  }

  addTarget() {
    let output = this.vertices[floor(random(this.vertices.length-this.numO-1, this.vertices.length))];
    let edge;

    let maxIterations = 150;
    let i = 0;

    do {
      edge = random(this.edges);
      i++;
    } while (!output.targets.contains(edge) && i < maxIterations);

    if (i < maxIterations) {
      output.targets.push(edge);
    }
  }

  removeTarget() {
    let output = this.vertices[floor(random(this.vertices.length-this.numO-1, this.vertices.length))];
    let target = output.targets[floor(random(output.targets.length))];

    output.targets.splice(target, 1);
  }

  moveVert() {
    let vert = random(this.vertices);
    vert.pos.add(p5.Vector.random2D().mult(10));
  }

  changeWeight() {
    let weight = random(this.edges);
    if (random(1) < 0.05) {
      weight.weight = random(0.2, 1);
    }
    else {
      weight.weight += random(-0.025, 0.025);
    }
  }

  mutate() {
    if (random(1) < 0.8) {
      this.changeWeight();
    }
    if (random(1) < 0.4) {
      this.moveVert();
    }
    if (random(1) < 0.3) {
      this.addEdge();
    }
    if (random(1) < 0.15) {
      this.addVert();    
    }
    if (random(1) < 0.2) {
      this.addTarget();
    }
    else if (random(1) < 0.6) {
      this.removeTarget();
    }
  }
}
Creature.STARTING_SIZE = 5;