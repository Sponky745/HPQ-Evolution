let creatures  = [];
let food       = [];
let initalSize = 1;
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
  worldWidth  = width;
  worldHeight = height;

  for (let i = 0; i < initalSize; i++) {
    creatures.push(new Creature(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2)));
  }

  view.offset = createVector(width/2, height/2);

  console.log("Version 2.1.0");
}

function draw() {
  let mouse = screenToWorld(mouseX, mouseY);

  // view.offset = createVector(creatures[0].pos.x + width/2, creatures[0].pos.y + height/2);

  background(255,0,0);
  translate(view.offset.x, view.offset.y);
  scale(view.zoom);
  
  fill(51);
  noStroke();
  rect(-worldWidth/2, -worldHeight/2, worldWidth, worldHeight);
  stroke(0);

  for (let i of creatures) {
    i.osfa(frameRule);
  }

  
  if (mouseIsPressed) {
  //   let record          = Number.MAX_SAFE_INTEGER;
  //   let vert          = null;
  //   let closestCreature = null;
  //   let creatureRecord  = Number.MAX_SAFE_INTEGER;

  //   for (let i of creatures) {
  //     let dst = p5.Vector.dist(i.pos, createVector(mouse.x, mouse.y));

  //     if (creatureRecord > dst) {
  //       creatureRecord  = dst;
  //       closestCreature = i;
  //     }
  //   }

  //   for (let i of closestCreature.vertices) {
  //     let dst = p5.Vector.dist(i.pos, createVector(mouse.x, mouse.y));

  //     if (record > dst) {
  //       record = dst;
  //       vert = i;
  //     }
  //   }

  //   vert.pos.set(mouse.x, mouse.y);

    if (!clickedLastFrame) {
      clickedLastFrame = true;
    } else {
      view.offset.add(createVector(mouseX, mouseY).sub(prevMousePos));
    } 
  }

  if (keyIsDown) {
    switch(keyCode) {
      case LEFT_ARROW:
        view.zoom -= 0.0025;
        break;
      case RIGHT_ARROW:
        view.zoom += 0.0025;
    }
  }

  prevMousePos = createVector(mouseX, mouseY);
}

function keyPressed() {
  let mouse = screenToWorld(mouseX, mouseY);
  let creature = null;
  let record   = Number.MAX_SAFE_INTEGER;

  for (let i of creatures) {
    let dst = p5.Vector.dist(i.pos, createVector(mouse.x, mouse.y));

    if (record > dst) {
      record   = dst;
      creature = i;
    }
  }

  if (key == " ") {
    creatures.push(new Creature(mouse.x, mouse.y));
  }
  else if (key == "v") {
    creature.addVert();
  }
  else if (key == "e") {
    creature.addEdge();
  }
  else if (key == "c") {
    creatures.push(creature.clone());
  }

  keyIsDown = true;
}

function keyReleased() {
  keyIsDown = false;
}

function screenToWorld(x, y) {
  return createVector(x - view.offset.x, y - view.offset.y).div(view.zoom);
}

function drawArrow(base, vec, col) {
  push();
  stroke(col);
  strokeWeight(3);
  fill(col);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}