let population = [];
let pheromones = [];
let food       = [];
let prevMousePos;
let clickedLastFrame = false;
let view = {
  offset: {
    x: 0,
    y: 0,
  },
  zoom: 0.25,
};
let modes = {
  select: "SELECT",
  draw:   "DRAW"  ,
  pan:    "PAN"   ,
};
let mode = modes.pan;

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 100; i++) {
    population.push(new Creature(random(-width/2 * 6, width/2 * 6), random(-height/2 * 6, height/2 * 6)));
  }

  for (let i = 0; i < 1000; i++) {
    food.push(createVector(random(-width/2 * 6, width/2 * 6), random(-height/2 * 6, height/2 * 6)));
    
    // food.push(createVector(random(width), random(height)));
  }
  
  view.offset = createVector(0, 0);
  
  prevMousePos = createVector(mouseX, mouseY);

  console.log("Version: 1.5");
}

function draw() {
  // push();
  background(255,0,0);
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
      // print(cr);
    } 
    
    if (creature.energy > 0) {
      newPop.push(creature);
    }
  }

  if (newPop.every(creature => creature.immortal)) {
    let record = -1;
    let creature = null;

    for (let i of population) {
      if (i.score > record) {
        record = i.score;
        creature = i;
      }
    }

    print(`EXODUS EVENT OCCURED: Best Creature had score of ${record}`);
    print(creature);

    newPop.push(creature.reproduce());

    for (let i = 0; i < 99; i++) {
      newPop.push(new Creature(random(-width/2 * 6, width/2 * 6), random(-height/2 * 6, height/2 * 6)));
    }

    newPop[0].immortal = true;
  }

  population = newPop;

  for (let i of food) {
    fill(0, 255, 0);
    circle(i.x, i.y, 14);
  }

  let newpheromones = [];
  for (let i of pheromones) {
    i.update();
    i.show();

    if (i.strength >= 0.01) {
      newpheromones.push(i);
    }
  }

  pheromones = [...newpheromones];

  // pop();
  
  
  if (mouseIsPressed) {
    switch (mode) {
      case modes.pan:
        if (!clickedLastFrame) {
          clickedLastFrame = true;
        } else {
          view.offset.add(createVector(mouseX, mouseY).sub(prevMousePos));
        } 
        break;
      case modes.draw:
        let brushSize = 50;
        let pos = createVector(mouseX + random(-brushSize/2, brushSize/2), mouseY + random(-brushSize/2, brushSize/2));
        pos.sub(view.offset);
        pos.x -= width/2;
        pos.y -= height/2;
        pos.div(view.zoom);
        food.push(pos.copy());
    }
  } else {
    clickedlastFrame = false;
  }
  
  prevMousePos = createVector(mouseX, mouseY);
}

function mousePressed() {

  switch (mode) {
    case modes.select:
      let record = Infinity;
      let cr = null;
      for (let i = population.length-1; i >= 0; i--) {
        let creature = population[i];
        
        if (dist(mouseX, mouseY, creature.pos.x, creature.pos.y) < record) {
          cr = creature;
        }
      }
    
      print(cr);
      break;
  }
}

function mouseWheel(e) {
  view.zoom += e.delta / 1000;
  
  // print(e.delta);
}

function best() {
  let record = -1;
  let bestCreature = null;
  for (let i of population) {
    if (i.score > record) {
      record = i.score;
      bestCreature = i;
    }
  }

  print(bestCreature);
}

// function setup() {
//   noCanvas();

//   let creature = new Creature(0,0);
//   creature.brain.addConnection();
//   print(creature.brain);

//   print(creature.brain.feedforward([0,1,0,1,1,0,1]));

//   let offspring = creature.reproduce();
//   print(offspring.brain);
//   print(offspring.brain.feedforward([1,0,0,1,1,0,1]));

//   creature.brain.addNode();
//   print(creature.brain);
//   print(creature.brain.feedforward([1,0,0,1,1,0,1]));

//   offspring = creature.reproduce();
//   print(offspring.brain);
//   print(offspring.brain.feedforward([1,0,0,1,1,0,1]));
// }