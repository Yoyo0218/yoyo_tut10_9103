let spotCircleR = [30, 35, 40, 45, 50]; // Set an aarry to hold the radius of the circle constitudeed by spots.
let spotR = 2; // Set the radius of the little spots.
let spacing = 2; // Set the spacing between each spot.
let patterns = []; // Set an array to store every patterns.
const hexagonSide = 68; // Set the side length of the hexagon.

let baseHexagonSide = 68; 
let timer;
let refreshTimer; 
let row = 0;
let col = 0;
let easing = 0.05; // Animation easing
let direction = 1; // Direction for size change
let currentSide = baseHexagonSide;


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0, 80, 111);
  arrangePatterns();
  timer = setInterval(drawNext, 4); //Draw Next
  refreshTimer = setInterval(resetCanvas, 4000); // Refresh canvas
}

function draw() {
  background(0, 80, 111); // Clear canvas

  // Update currentSide
  let targetSize;
  if (direction > 0) {
    targetSize = baseHexagonSide * 1.0;
  } else {
    targetSize = baseHexagonSide * 0.7;
  }

  currentSide = lerp(currentSide, targetSize, easing); // Smoothly change size
  
  // Reverse direction of size changing
  if (abs(currentSide - targetSize) < 0.1) {
    direction *= -1; 
  }
  
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < patterns[i].length; j++) {
      patterns[i][j].display(currentSide);
    }
  }
  if (row < patterns.length) {
    for (let j = 0; j < col; j++) {
      patterns[row][j].display(currentSide);
    }
  }
}

function drawNext() {
  if (row < patterns.length) {
    col++;
    if (col > patterns[row].length) {
      col = 0;
      row++;
    }
  } else {
    clearInterval(timer); // Stop when all rows are drawn
  }
}

function resetCanvas() {
  patterns = []; 
  row = 0; // Reset pattern
  col = 0;
  arrangePatterns();
  clearInterval(timer); 
  timer = setInterval(drawNext, 4); 
}

// A class to create hexagon
class Hexagon {
  constructor(x, y, side) {
  //The x and y decide the center point of the hexagon
  //Length of each side of the hexagon
    this.x = x;
    this.y = y;
    this.side = side;
  }

  display(currentSide) {
    push();
    translate(this.x, this.y);
    stroke(254,199,57);
    strokeWeight(4);
    fill(255,255,255,0);
    rotate(PI / 2);
    //Draw the hexagon
    beginShape();
    //calculate every vertices of the hexagon.
    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / 6) {
      let sx = cos(angle) * currentSide;
      let sy = sin(angle) * currentSide;
      vertex(sx, sy);
    }
    endShape(CLOSE);
    pop();
  }
}

class Pattern {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.startColor = color(random(255), random(255), random(255));
    this.endColor = color(random(255), random(255), random(255));
    this.currentColor = this.startColor;
    this.targetColor = this.endColor;
    this.coreColor = color(random(['#F51531', '#018221']));
    this.spotCirclePositions = [];
    this.innerColors = [];

    for (let i = 0; i < 10; i++) {
      let r = Math.floor(Math.random() * 256);
      let g = Math.floor(Math.random() * 256);
      let b = Math.floor(Math.random() * 256);
      let colorValue = color(r, g, b);
      this.innerColors.push(colorValue);
    }

    //Calculate the positions of spots
    for (let radius of spotCircleR) {
      let circumference = TWO_PI * radius;
      let numSpots = floor(circumference / (2 * spotR + spacing));
      for (let i = 0; i < numSpots; i++) {
        let angle = map(i, 0, numSpots, 0, TWO_PI);
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        this.spotCirclePositions.push({ x, y });
      }
    }

    this.hexagon = new Hexagon(0, 0, hexagonSide);
  }

  updateColor() {
    this.currentColor = lerpColor(this.currentColor, this.targetColor, easing);
    if (frameCount % 120 == 0) {
      this.targetColor = color(random(255), random(255), random(255));
    }
  }

  display(currentSide) {
    this.updateColor();
    push();
    translate(this.x, this.y);
    this.hexagon.display(currentSide);

    // Background Circle
    noStroke();
    fill(255,255,255);
    ellipse(0, 0, currentSide * 1.6, currentSide * 1.6); // Adjust circle size
    for (let pos of this.spotCirclePositions) {
      fill(this.currentColor);
      ellipse(pos.x * (currentSide / hexagonSide), pos.y * (currentSide / hexagonSide), spotR * 2, spotR * 2); // Adjust spot positions
    }

    // Generate the 10 circle that radius between 30 and 50
    for (let i = 0; i < 10; i++) {
      let radius = random(30, 50) * (currentSide / hexagonSide); // Adjust circle size
      fill(this.innerColors[i]);
      ellipse(0, 0, radius, radius);
    }

    // Generate the core circles
    fill(0);
    ellipse(0, 0, currentSide * 0.3, currentSide * 0.3); // Adjust circle size
    fill(this.coreColor);
    ellipse(0, 0, currentSide * 0.2, currentSide * 0.2); // Adjust circle size
    fill(255);
    ellipse(0, 0, currentSide * 0.1, currentSide * 0.1); // Adjust circle size
    pop();
  }
}

//Make the canvas change according to the window size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  arrangePatterns();
  background(0);
  row = 0; // Reset pattern
  col = 0; 
}


// Alternate the horizontal offset for each row to create a honeycomb
function arrangePatterns() {
  patterns = [];
  let yOffset = 0;
  let alternate = false;
  while (yOffset < height + 55) {
    let xOffset;
    if (alternate) {
      xOffset = 110;
    } else {
      xOffset = 50;
    }

    let rowPatterns = [];
    for (let x = -xOffset; x < width + 55; x += 120) {
      rowPatterns.push(new Pattern(x, yOffset));
    }
    patterns.push(rowPatterns);
    yOffset += 104;
    alternate = !alternate;
  }
}