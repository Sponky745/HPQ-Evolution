
class Neuron {
  constructor(id, label = "") {
    this.connections = [];
    this.label = label;
    this.output = 0;
    this.id = id;

    this.inputs = [];
  }

  addInputs(num) {
    this.inputs.push(num);
  }

  feedforward() {
    for (let i = 0; i < this.inputs.length; i++) { 
      this.output += this.inputs[i];
    }

    this.output = Math.tanh(this.output);

    for (let i of this.connections) {
      i.feedforward();
    }
  }

  copy() {
    let neuron = new Neuron(this.id, this.label);
    // for (let i = 0; i < this.connections.length; i++) {
    //   neuron.connections[i] = this.connections[i].copy();
    //   print(neuron.connections[i]);
    // }
    return neuron;
  }
}

class Connection {
  constructor(a, b, inNeuron, outNeuron, weight) {
    this.a = a;
    this.b = b;
    this.inNeuron = inNeuron;
    this.outNeuron = outNeuron;
    this.weight = weight;
  }

  copy(inNeur, outNeur) {
    return new Connection(inNeur.id, outNeur.id, inNeur, outNeur, this.weight);
  }


  feedforward() {
    this.outNeuron.addInputs(this.inNeuron.output * this.weight);
  }


  disable() {
    this.weight *= 0;
  }
}

 

class NeuralNetwork {
  constructor(numI, numO, labelsI = [], labelsO = []) {
    this.inputs = [];  // Merge these
    this.outputs = []; // Merge these
    this.conns = [];

    this.index = numI;

    this.labels = [labelsI, labelsO];

    for (let i = 0; i < numI; i++) {
      this.inputs.push(new Neuron(-i-1, labelsI[i]));
    }

    for (let i = 0; i < numO; i++) {
      this.outputs.push(new Neuron(Number.MAX_SAFE_INTEGER - i, labelsO[i]));
    }

    this.neurons = [...this.inputs, ...this.outputs];
  }

  connect() {
    for (let i = 0; i < this.neurons.length; i++) { 
      this.neurons[i].conns = [];
    }

    for (let i = 0; i < this.conns.length; i++) { 
      this.conns[i].inNeuron.conns.push(this.conns[i]);
    }
  }

  get(id) {
    for (let i = 0; i < this.neurons.length; i++) {
      if (this.neurons[i].id == id) return this.neurons[i];
    }
    return -1;
  }

  copy() {
    let nn = new NeuralNetwork(this.inputs.length, this.outputs.length, this.labels[0], this.labels[1]);

    for (let i = 0; i < this.neurons.length; i++) {
      nn.neurons[i] = this.neurons[i].copy();
    }

    for (let i = 0; i < this.conns.length; i++) {
      nn.conns[i] = this.conns[i].copy(nn.get(this.conns[i].a), nn.get(this.conns[i].b))
    }

    nn.connect();
    return nn;
  }

  invalidNeurons(n1, n2) {
    return (n1.id >= n2.id);
  }

  mutate() {
    if (this.conns.length == 0) {
      this.addConnection();
    }

    if (random(1) < 0.8) {
      this.changeWeight();
    }

    if (random(1) < 0.05) {
      this.addConnection();
    }

    if (random(1) < 0.01) {
      this.splitConnection();
    }
  }

  changeWeight() {
    let conn = random(this.conns);

    if (random(1) < 0.05) {
      conn.weight = random(-1, 1);
    } else {
      conn.weight += random(-0.05, 0.05);
    }
  }


  addConnection() {
    let neuron1;
    let neuron2;

    do {
      neuron1 = random(this.neurons);
      neuron2 = random(this.neurons);
    } while (this.invalidNeurons(neuron1, neuron2));

    let conn = new Connection(neuron1.id, neuron2.id, neuron1, neuron2, random(-1, 1));

    neuron1.connections.push(conn);
    this.conns.push(conn);
  }

  splitConnection() {
    let index = floor(random(this.conns.length));
    let conn = this.conns[index];

    conn.disable();

    let newNeuron = new Neuron(this.index);
    let aToNew = new Connection(conn.a.id, newNeuron.id, conn.a, newNeuron, conn.weight);
    let newToB = new Connection(newNeuron.id, conn.b.id, conn.b, newNeuron, conn.weight);

    conn.inNeuron.connections.push(aToNew);
    newNeuron.connections.push(newToB);

    this.neurons.splice(this.index, 0, newNeuron);

    this.conns.push(aToNew, newToB);

    this.index++;
  }


  feedforward(inputs, yes = false) {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].addInputs(inputs[i]);
      this.inputs[i].feedforward();

      // if (yes)
      //   print(this.inputs[i].connections);
    }

    for (let i = this.inputs.length; i < this.neurons.length; i++) {
      this.neurons[i].feedforward();
    }

    let out = [];

    for (let i of this.outputs) {
      i.feedforward();
      out.push(i.output);
    }

    for(let i of this.neurons) {
      i.inputs = [];
    }

    return [...out];

  }

}