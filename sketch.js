let population = [];
let food = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 100; i++) {
    population.push(new Creature(random(width), random(height)));
  }

  for (let i = 0; i < 25; i++) {
    food.push(createVector(random(width), random(height)));
  }
}

function draw() {
  background(220);
  let newPop = [];
  for (let i = population.length-1; i >= 0; i--) {
    let creature = population[i];
    creature.update();
    
    if (creature.energy >= 8) {
      creature.energy /= 2;
      let cr = creature.reproduce();
      newPop.push(cr);
    } 
    
    if (creature.energy > 0) {
      newPop.push(creature);
    }
  }
  population = newPop;

  for (let i of food) {
    fill(0, 255, 0);
    circle(i.x, i.y, 8);
  }
}

function mousePressed() {
  let record = Infinity;
  let cr = null;
  for (let i = population.length-1; i >= 0; i--) {
    let creature = population[i];
    
    if (dist(mouseX, mouseY, creature.pos.x, creature.pos.y) < record) {
      cr = creature;
    }
  }
  
  print(cr);
}