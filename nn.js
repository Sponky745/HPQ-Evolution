class Node {
  constructor(id, layer, label = "") {
    this.id          = id;
    this.layer       = layer;
    this.label       = label;
    this.output      = 0;
    this.inputs      = [];
    this.connections = [];
  }

  clearConnections() {
    this.connections = [];
  }

  clean() {
    this.inputs = [];
    this.output = 0;
  }

  engage() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.output += this.inputs[i];
    }

    if (this.layer != 0) {
      this.output = Math.tanh(this.output);
    }

    for (let i of this.connections) {
      i.propogate();
    }
  }

  addInput(input) {
    this.inputs.push(input);
  }

  addConnection(connection) {
    this.connections.push(connection);
  }

  clone() {
    return new Node(this.id, this.layer, this.label);
  }
}

class Connection {
  constructor(n_in, n_out, weight) {
    this.in     = n_in;
    this.out    = n_out;
    this.a      = n_in.id;
    this.b      = n_out.id;
    this.weight = weight;
  }

  propogate() {
    this.out.addInput(this.in.output * this.weight);
  }

  disable() {
    this.weight *= 0;
  }

  clone(a, b) {
    return new Connection(a, b, this.weight);
  }

  mutateWeight() {
    this.weight += random(-0.05, 0.05);
  }
}

class NeuralNetwork {
  constructor(numI, numO, labelsI = [], labelsO = []) {
    this.nodes       = [];
    this.connections = [];
    this.labels      = [labelsI, labelsO];  
    this.nextNodeId = 0;

    for (let i = 0; i < numI; i++) {
      this.nodes.push(new Node(this.nextNodeId, 0));
      this.nextNodeId++;
    }

    for (let i = 0; i < numO; i++) {
      this.nodes.push(new Node(this.nextNodeId, Number.POSITIVE_INFINITY));
      this.nextNodeId++;
    }
  }

  sort() {
    let layers = [];
    let newNodes = [];

    for (let i = 0; i < this.nodes.length; i++) {
      let unique = true;
      for (let j = 0; j < layers.length; j++) {
        if (this.nodes[i].layer == layers[j][0].layer) {
          layers[j].push(this.nodes[i]);
          unique = false;
          break;
        }
      }
      if (unique) {
        layers.push([ this.nodes[i] ]);
      }
    }

    layers.sort((a, b) => a[0].layer - b[0].layer);

    for (let i = 0; i < layers.length; i++) {
      for (let j = 0; j < layers[i].length; j++) {
        newNodes.push(layers[i][j]);
      }
    }

    this.nodes = [...newNodes];
  }

  clone() {
    let newNet = new NeuralNetwork(-1, -1, this.labels[0], this.labels[1]);

    for (let i = 0; i < this.nodes.length; i++) {
      newNet.nodes[i] = this.nodes[i].clone();
    }

    for (let i = 0; i < this.connections.length; i++) {
      newNet.connections[i] = this.connections[i].clone(newNet.getNodeById(this.connections[i].a), newNet.getNodeById(this.connections[i].b));
    }

    newNet.connect();

    newNet.nextNodeId = this.nextNodeId;

    return newNet;
  }

  feedforward(inputs) {
    this.sort();

    let outputs = [];

    for (let i of this.nodes) {
      if (i.layer == 0) {
        i.addInput(inputs[i.id]);
      }
      i.engage();
      if (i.layer == Number.POSITIVE_INFINITY) {
        outputs.push(i.output);
      }
    }

    for (let i of this.nodes) {
      i.clean();
    }

    return [...outputs];
  }

  mutate() {
    if (this.connections.length == 0) {
      this.addConnection();
      return;
    }

    if (random(1) <= 0.8) {
      this.changeWeight();
    }

    if (random(1) <= 0.05) {
      this.addConnection();
    }

    if (random(1) <= 0.01) {
      this.addNode();
    }
  }

  randomNodesAreInvalid(a, b) {
    return (a.layer >= b.layer);
  }

  randomConnectionIsInvalid(connection) {
    return (connection.weight == 0);
  }

  addConnection() {
    let a = random(this.nodes);
    let b = random(this.nodes);

    while (this.randomNodesAreInvalid(a, b)) {
      a = random(this.nodes);
      b = random(this.nodes);
    }

    let connection = new Connection(a, b, random(-1, 1));

    this.connections.push(connection);

    a.addConnection(connection);
  }

  addNode() {
    let connection = random(this.connections);

    while (this.randomConnectionIsInvalid(connection)) {
      connection = random(this.connections);
    }

    let newNode = new Node(this.nextNodeId, connection.in.layer+1);
    this.nextNodeId++;

    let aToNew = new Connection(connection.in, newNode       , connection.weight);
    let newToB = new Connection(newNode      , connection.out, connection.weight);

    this.nodes      .push(newNode);
    this.connections.push(aToNew, newToB);

    connection.disable();
    this.connect();
  }

  changeWeight() {
    for (let i of this.connections) {
      i.mutateWeight();
    }
  }

  getNodeById(id) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].id == id) {
        return this.nodes[i];
      }
    }
  }

  getNodesByLayer(layer) {
    let gotten = [];

    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].layer == layer) {
        gotten.push(this.nodes[i]);
      }
    }

    return [...gotten];
  }

  connect() {

    for (let i of this.nodes) {
      i.clearConnections();
    }

    for (let i = 0; i < this.connections.length; i++) { 
      this.connections[i].in.addConnection(this.connections[i]);
    }
  }
}