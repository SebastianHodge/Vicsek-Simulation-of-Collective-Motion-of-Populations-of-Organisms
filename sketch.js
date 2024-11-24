let particles = [];
let numParticles = 300;
let radius = 20;
let bodySize = 5;  // Minimum allowed distance between organisms
let personalSpace = 10;  // Distance where soft repulsion starts
let noiseLevel = 0.2;
let speed = 1;
let trailLength = 20;
let radiusSlider, noiseSlider, numParticlesSlider, trailSlider;
let radiusLabel, noiseLabel, numParticlesLabel, trailLabel;
let orderParameterDiv, sliderDiv;

function setup() {
  createCanvas(350, 350);

  // Create a div to hold the sliders and labels
  sliderDiv = createDiv();
  sliderDiv.position(0, height + 10);  // Position it beneath the canvas

  // Sliders and their corresponding labels
  createP('Interaction Radius').parent(sliderDiv);
  radiusSlider = createSlider(5, 50, radius);
  radiusSlider.parent(sliderDiv);
  radiusLabel = createP(`Radius: ${radius}`).parent(sliderDiv);  // Label for the slider

  createP('Noise Level').parent(sliderDiv);
  noiseSlider = createSlider(0, 1, noiseLevel, 0.01);
  noiseSlider.parent(sliderDiv);
  noiseLabel = createP(`Noise Level: ${noiseLevel}`).parent(sliderDiv);  // Label for the slider

  createP('Number of Particles').parent(sliderDiv);
  numParticlesSlider = createSlider(10, 500, numParticles);
  numParticlesSlider.parent(sliderDiv);
  numParticlesLabel = createP(`Number of Particles: ${numParticles}`).parent(sliderDiv);  // Label for the slider

  createP('Trail Length').parent(sliderDiv);
  trailSlider = createSlider(0, 50, trailLength);
  trailSlider.parent(sliderDiv);
  trailLabel = createP(`Trail Length: ${trailLength}`).parent(sliderDiv);  // Label for the slider

  // Create a div for the order parameter below the sliders
  orderParameterDiv = createDiv();
  orderParameterDiv.position(0, sliderDiv.size().height + height + 20);

  initializeParticles();
}

function draw() {
  background(255, 255, 255, 100); // Fading background for trace effect
  
  // Update parameters from sliders
  radius = radiusSlider.value();
  noiseLevel = noiseSlider.value();
  let newNumParticles = numParticlesSlider.value();
  trailLength = trailSlider.value();
  
  // Update slider labels with current values
  radiusLabel.html(`Radius: ${radius}`);
  noiseLabel.html(`Noise Level: ${noiseLevel.toFixed(2)}`);
  numParticlesLabel.html(`Number of Particles: ${numParticles}`);
  trailLabel.html(`Trail Length: ${trailLength}`);
  
  // Adjust number of particles if slider changes
  if (newNumParticles !== numParticles) {
    numParticles = newNumParticles;
    initializeParticles();
    background(255, 255, 255);
  }

  // Update and display particles
  let totalAlignment = createVector(0, 0);
  for (let p of particles) {
    p.update();
    p.show();
    totalAlignment.add(p.velocity.copy().normalize());
  }
  
  // Calculate and display order parameter
  let orderParameter = totalAlignment.mag() / numParticles;
  orderParameterDiv.html(`Order Parameter: ${orderParameter.toFixed(2)}`);
}

function initializeParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
}

class Particle {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.speed = speed;
    this.history = [];
  }

  update() {
    let avgDir = createVector(0, 0);
    let count = 0;

    for (let other of particles) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      
      // Check for neighbors within interaction radius
      if (d > 0 && d < radius) {
        avgDir.add(other.velocity);
        count++;
      }
      
      // Soft repulsion for personal space boundary
      if (d > bodySize && d < personalSpace) {
        let repulse = p5.Vector.sub(this.position, other.position);
        let strength = map(d, bodySize, personalSpace, 1, 0);  // Smoothly scale repulsion strength
        repulse.setMag(strength);
        this.position.add(repulse);  // Gently push the particle away
      }
      
      // Hard repulsion for body size limit
      if (d > 0 && d < bodySize) {
        let strongRepulse = p5.Vector.sub(this.position, other.position);
        strongRepulse.setMag(bodySize - d);  // Stronger push if inside body size
        this.position.add(strongRepulse);
      }
    }

    if (count > 0) {
      avgDir.div(count);
      avgDir.setMag(this.speed);  // Normalize the velocity magnitude to maintain consistent speed
      this.velocity.lerp(avgDir, 0.1);  // Align with neighbors, account for organism processing speed and implement smooth changes in momentum
    }

    // Add noise
    let noiseVec = p5.Vector.random2D();
    noiseVec.mult(noiseLevel);
    this.velocity.add(noiseVec);

    // Ensure velocity magnitude stays consistent
    this.velocity.setMag(this.speed);

    // Move particle
    this.position.add(this.velocity);

    // Apply periodic boundary conditions
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;

    // Store position in history for tracing path
    this.history.push(this.position.copy());
    if (this.history.length > trailLength) {
      this.history.shift();
    }
  }

  show() {
    stroke(0);
    fill(175);
    ellipse(this.position.x, this.position.y, bodySize, bodySize);

    // Draw the trace path
    noFill();
    beginShape();
    for (let i = 1; i < this.history.length; i++) {
      let prev = this.history[i - 1];
      let curr = this.history[i];

      // Check if the particle wraps around horizontally or vertically
      if (abs(prev.x - curr.x) > width / 2 || abs(prev.y - curr.y) > height / 2) {
        // Break the shape if wrapping occurs
        endShape();
        beginShape();
      }
      vertex(curr.x, curr.y);
    }
    endShape();
  }
}
