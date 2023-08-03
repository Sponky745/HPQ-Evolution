let creatures  = [];
let food       = [];
let initialSize = 25;
let frameRule  = 21;
let view       = {
  offset: -1,
  zoom: 0.25,
};

let worldWidth;
let worldHeight;

let clickedLastFrame = false;
let prevMousePos;

let keyIsDown = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  worldWidth  = width  * 3;
  worldHeight = height * 3;

  for (let i = 0; i < initialSize; i++) {
    creatures.push(new Creature(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2)));
  }

  for (let i = 0; i < initialSize * 15; i++) {
    food.push(createVector(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2)));
  }

  view.offset = createVector(width/2, height/2);

  console.log("Version 2.2.3");
}

function draw() {
  let mouse = screenToWorld(mouseX, mouseY);

  background(255,0,0);
  translate(view.offset.x, view.offset.y);
  scale(view.zoom);
  
  fill(51);
  noStroke();
  rect(-worldWidth/2, -worldHeight/2, worldWidth, worldHeight);
  stroke(0);

  for (let i of food) {
    fill(0, 255, 0);
    circle(i.x, i.y, 4);
  }

  let newCreatures = [];

  for (let i of creatures) {
    i.osfa(frameRule);

    let isCreatureDead = false;

    if (i.energy >= 8) {
      let offspring = i.clone();
      offspring.mutate();
      newCreatures.push(offspring);
      i.energy /= 2;
    }

    if (i.energy <= 0) isCreatureDead = true;

    if (!isCreatureDead) {
      newCreatures.push(i);
    }

  }

  creatures = [...newCreatures];

  
  // if (mouseIsPressed) {
  //   if (!clickedLastFrame) {
  //     clickedLastFrame = true;
  //   } else {
  //     view.offset.add(createVector(mouseX, mouseY).sub(prevMousePos));
  //   } 
  // }

  // if (keyIsDown) {
  //   switch(keyCode) {
  //     case LEFT_ARROW:
  //       view.zoom -= 0.0025;
  //       break;
  //     case RIGHT_ARROW:
  //       view.zoom += 0.0025;
  //   }
  // }

  prevMousePos = createVector(mouseX, mouseY);
}

function mousePressed() {
  let record = Infinity;
  let cr = null;
  for (let i = creatures.length-1; i >= 0; i--) {
    let creature = creatures[i];
    
    if (dist(mouseX, mouseY, creature.pos.x, creature.pos.y) < record) {
      cr = creature;
    }
  }

  print(cr);
}

function keyPressed() {
  keyIsDown = true;
}

function keyReleased() {
  keyIsDown = false;
}

function screenToWorld(x, y) {
  return createVector(x - view.offset.x, y - view.offset.y).div(view.zoom);
}