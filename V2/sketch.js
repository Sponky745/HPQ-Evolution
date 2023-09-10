let creatures   = [];
let originals   = [];
let EVERYTHING  = [];
let food        = [];
let initialSize = 25;
let frameRule   = 21;
let view        = {
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
  worldWidth  = width  * 4;
  worldHeight = height * 4;

  for (let i = 0; i < initialSize; i++) {
    creatures .push(new Creature(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2)));
    EVERYTHING.push(creatures[i]);
  }

  originals = [...creatures];

  view.offset = createVector(width/2, height/2);

  console.log("Version 2.9.3");


  // --------------------------------------------------- FOOD -------------------------------------------------------------------

  for (let i = 0; i < initialSize * 15; i++) {
    food.push(createVector(random(-worldWidth/2, -75), random(-worldHeight/2, -75)));
  }

  for (let i = 0; i < initialSize * 51; i++) {
    food.push(createVector(random(75, worldWidth/2), random(-worldHeight/2, -75)));
  }

  for (let i = 0; i < initialSize * 20; i++) {
    food.push(createVector(random(75, worldWidth/2), random(75, worldHeight/2)));
  }

  for (let i = 0; i < initialSize * 75; i++) {
    food.push(createVector(random(-worldWidth/2, -75), random(75, worldHeight/2)));
  }
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

  // let visibleFood = food.filter(elem => (elem.x > 0 || elem.x < width || elem.y > 0 || elem.y < height));

  // for (let i of visibleFood) {
  //   fill(0, 255, 0);
  //   circle(i.x, i.y, 6);
  // }

  let newCreatures = [];

  for (let i of creatures) {
    i.osfa(frameRule);

    let isCreatureDead = false;

    if (i.energy >= 8) {
      let offspring = i.reproduce();
      newCreatures.push(offspring);
      EVERYTHING  .push(offspring);
      i.energy /= 2;
    }

    if (i.energy <= 0) isCreatureDead = true;

    if (!isCreatureDead) {
      newCreatures.push(i);
    }
  }

  if (newCreatures.length == 0) {
    let bestest = best()[0];
    let food = [];

    for (let i = 0; i < initialSize * 25; i++) {
      food.push(createVector(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2)));
    }

    newCreatures[0] = bestest.clone();


    let bestOfTheBloodlines = [];


    for (let i of originals) {
      bestOfTheBloodlines.push(maxnode(i));
    }

    for (let i of bestOfTheBloodlines) {
      i.fitness = i.score / bestest.score;
    }

    let sum = 0;

    for (let i of bestOfTheBloodlines) {
      sum += i.fitness;
    }

    const selectParent = (population) => {
      let rand = random(sum);

      let selectPointer = 0;

      for (let  j = 0; j < population.length; j++) {
        selectPointer += population[j].fitness;
        if (selectPointer > rand) {
          return population[j];
        }
      }

      return null;
    };


    newCreatures[1] = bestest.reproduce();
    newCreatures[2] = bestest.reproduce();


    for (let i = 3; i < floor(initialSize/2); i++) {
      const parent = selectParent(bestOfTheBloodlines);

      newCreatures.push(parent.reproduce());
    }

    for (let i = floor(initialSize/2); i < initialSize; i++) {
      newCreatures.push(new Creature(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2)));
    }

    for (let i of newCreatures) {
      // i.setPos(random(-worldWidth/2, worldWidth/2), random(-worldHeight/2, worldHeight/2));
      i.score *= 0;
    }

    print("Mass Extinction")
    print(best());
    // print(newCreatures);

    originals  = [...newCreatures];
    EVERYTHING = [...newCreatures];
  }

  if (mouseIsPressed) {
    if (!clickedLastFrame) {
      clickedLastFrame = true;
    } else {
      view.offset.add(createVector(mouseX, mouseY).sub(prevMousePos));
    } 

    let record = 8;
    let cr = null;
    for (let i = creatures.length-1; i >= 0; i--) {
      let creature = creatures[i];

      let pos = screenToWorld(creature.pos);
      
      if (dist(mouse.x, mouse.y, creature.pos.x, creature.pos.y) < record) {
        cr = creature;
      }
    }

    if (cr) {
      cr.score += 0.001;
      cr.energy += 0.05;
      print(cr.score);
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

  creatures = [...newCreatures];

  prevMousePos = createVector(mouseX, mouseY);
}

function mousePressed() {
  // let record = Infinity;
  // let cr = null;
  // for (let i = creatures.length-1; i >= 0; i--) {
  //   let creature = creatures[i];
    
  //   if (dist(mouseX, mouseY, creature.pos.x, creature.pos.y) < record) {
  //     cr = creature;
  //   }
  // }

  // print(cr);
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

function best() {
  let record = -1;
  let creature = null;

  for (let i of EVERYTHING) {
    if (i.score > record) {
      record = i.score;
      creature = i;
    }
  }

  return [creature, record]; 
}

function maxnode(root) {
  let stack        = [root];
  let nodes        = [];

  while (stack.length > 0) {
    let selected = stack.pop();
    for (let i of selected.children) {
      stack.push(i);
    }

    nodes.push(selected);
  }

  nodes = nodes.sort((a, b) => a.val - b.val);
  creature = nodes[0];
  return creature;
};