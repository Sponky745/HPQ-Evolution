class Edge {
  constructor(a, b, weight, id) {
    this.in                 = a;
    this.out                = b;
    this.weight             = weight;
    this.a                  = a.id;
    this.b                  = b.id;
    this.restLength         = max(20, p5.Vector.dist(this.in.pos, this.out.pos));
    this.originalRestLength = max(20, p5.Vector.dist(this.in.pos, this.out.pos));
    this.id                 = id;
  }

  midpoint() {
    return p5.Vector.add(this.in.pos, this.out.pos).div(2);
  }

  feedforward(x) {
    this.out.addInput(x * this.weight);
  }

  show() {
    strokeWeight(this.weight * 8);
    line(this.in.pos.x, this.in.pos.y, this.out.pos.x, this.out.pos.y);
  }

  update() {
    // F = -kx

    let x = p5.Vector.dist(this.in.pos, this.out.pos) - this.restLength;
    
    let forceA = p5.Vector.sub(this.in.pos, this.out.pos);
    forceA.normalize();
    forceA.mult(-this.weight/2 * x);
    forceA.div(2);

    let forceB = p5.Vector.mult(forceA, -1);

    this.in .acc.add(forceA);
    this.out.acc.add(forceB);
  }

  clone(a, b) {
    return new Edge(a, b, this.weight, this.id);
  }
}