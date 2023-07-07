let population = [];
let food = [];

let prevMousePos;
let clickedLastFrame = false;

let view = {
  
  offset: {
    x: 0,
    y: 0,
  },
  zoom: 0.25,
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 100; i++) {
    population.push(new Creature(random(-width/2 * 6, width/2 * 6), random(-height/2 * 6, height/2 * 6)));
    
//     population.push(new Creature(random(width), random(height)));
  }

  for (let i = 0; i < 200; i++) {
    food.push(createVector(random(-width/2 * 6, width/2 * 3), random(-height/2 * 6, height/2 * 6)));
    
    // food.push(createVector(random(width), random(height)));
  }
  
  view.offset = createVector(0, 0);
  
  prevMousePos = createVector(mouseX, mouseY);
}

function draw() {
  background(204, 0, 0);
  translate(width/2 + view.offset.x, height/2 + view.offset.y);
  scale(view.zoom);
  
  fill(51);
  noStroke();
  rect(-width/2 * 6, -height/2 * 6, width*6, height*6);
  stroke(0);
  
  let newPop = [];
  for (let i = population.length-1; i >= 0; i--) {
    let creature = population[i];
    creature.update();
    
    if (creature.energy >= 8) {
      creature.energy *= 0;
      let cr = creature.reproduce();
      newPop.push(cr);
      print("BABY")
    } 
    
    if (creature.energy > 0) {
      newPop.push(creature)
    }
  }
  population = newPop;

  for (let i of food) {
    fill(0, 255, 0);
    circle(i.x, i.y, 8);
  }
  
  
  
  if (mouseIsPressed) {
    if (!clickedLastFrame) {
      clickedLastFrame = true;
    } else {
      view.offset.add(createVector(mouseX, mouseY).sub(prevMousePos));
    }
  } else {
    clickedlastFrame = false;
  }
  
  prevMousePos = createVector(mouseX, mouseY);
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

function mouseWheel(e) {
  view.zoom += e.delta / 1000;
  
  print(e.delta);
}