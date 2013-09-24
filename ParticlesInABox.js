/*
Author: Michael Doescher
This program implements the particles bouncing around in a box as a JavaScript animation
Framework provided in CS558 Assignment 1 and 2 Description by Mikola Lysenko
Created 9/19/2013
 */


var sim = require("./mysimulator.js");
var canvasElement = document.querySelector("#canvas");
var gc = canvasElement.getContext("2d");
var simulationData = init();
updateForm(simulationData);
simulationData.ground = [0.2, 1.0];
var boundary = boundaryPoints();

// what are the pixel space coordinates of [0,0] and [1,1]
var coordinateSystem = [[canvasElement.width/2, canvasElement.height/2], [canvasElement.width-10, 10]];

setInterval(function() {updateSimulation(gc, simulationData, boundary, coordinateSystem)}, 30);

function init() {
	return {
		position : [[0.0, 0.5], [0.0, 0.5], [0.0,0.5], [0.0, 0.5], [-0.5, 0.5]],
		velocity : [[0.0, 1.0], [0.0, -1.0], [-2.0, 0.0], [2.0, 0.0], [1.0, -1.0]],
		ground   : [0.0, 1.0],
		dt       : 0.02
	};
};

function boundaryPoints() {
	var ground = simulationData.ground;
	bp = new Array();
	bp.push([-1, 1]);
	bp.push([1, 1]);
	bp.push(implicitLineIntersection([ground[0], ground[1], 0], [-1, 0, 1]));
	bp.push(implicitLineIntersection([ground[0], ground[1], 0], [1, 0, 1]));
	return bp;
};


function implicitLineIntersection(line1, line2) {
	var a1 = line1[0];
	var a2 = line2[0];
	var b1 = line1[1];
	var b2 = line2[1];
	var c1 = line1[2];
	var c2 = line2[2];	
	
	if (a1 == 0 && b1 == 0) return null;	// line1 is not a line
	if (a2 == 0 && b2 == 0) return null;	// line2 is not a line
	if (a1 == 0 && a2 == 0) return null;	// parallel
	if (b1 == 0 && b2 == 0) return null;	// parallel
	
	if (a1 == 0) { 							// line 1 is horizontal
		var y = (-1)*c1/b1;
		return [(-1)*(b2*y+c2)/a2, y];
	}	
	if (a2 == 0) {							// line 2 is horizontal
		var y = (-1)*c2/b2;
		return [(-1)*(b1*y+c1)/a1, y];
	}
	if (b1 == 0) {							// line 1 is vertical
		var x = (-1)*c1/a1;
		return [x, (-1)*(a2*x+c2)/b2];
	}
	if (b2 == 0) {							// line 2 is vertical
		var x = (-1)*c2/a2;
		return [x, (-1)*(a1*x+c1)/b1];
	}
	if (a1/b1 - a2/b2 < 1e-6 && a1/b1 - a2/b2 > -1e-6) return null;		// parallel
	
	var x = (-1) * (c2-c1*b2/b1) / (a2-a1*b2/b1)	// general lines
	return [x, (-1)*(c1+a1*x) / b1];
};

function updateSimulation(gc, sd, boundary, coordinateSystem) {
	var nextState = sim(sd.position, sd.velocity, sd.ground, sd.dt);
	sd.position = nextState.position;
	sd.velocity = nextState.velocity;

	draw(gc, sd, boundary, coordinateSystem);
}



function draw(gc, sd, boundary, coordinateSystem) {
	// clear the canvas - (color the entire canvas red)
	gc.fillStyle = "rgb(255, 0, 0)";
	gc.fillRect(0, 0, canvasElement.width, canvasElement.height);	
	
	// draw 'box' containing particles
	gc.fillStyle = "rgb(255, 255, 0)"; // white box
	gc.beginPath(); 
	var p = toCanvasCoordinates(boundary[0], coordinateSystem);
	
	gc.moveTo(p[0], p[1]);
	for (var i = 1; i<boundary.length; i++) {
		p = toCanvasCoordinates(boundary[i], coordinateSystem);
		gc.lineTo(p[0], p[1]);
	}
	gc.closePath();
	gc.fill();	

	// draw particles
	gc.fillStyle = "rgb(0, 255, 0)";
	for (var i = 0; i<sd.position.length; i++) {
		p = toCanvasCoordinates(sd.position[i], coordinateSystem);
		gc.beginPath();
		gc.moveTo(p[0], p[1]);
		gc.arc(p[0], p[1], 4, 0, 2*Math.PI, true);
		gc.closePath();
		gc.fill();
	}
}


// what are the pixel space coordinates of [0,0] and [1,1]
// var coordinateSystem = [[canvasElement.width/2, canvasElement.height/2], [canvasElement.width-10, 10]];

function toCanvasCoordinates(point, coordinateSystem) {
	var p = new Array(2);
	for (var i = 0; i<2; i++) {
		p[i] = point[i]* (coordinateSystem[1][i] - coordinateSystem[0][i]) + coordinateSystem[0][i]
	}
	return p;
}


// below is the code that runs the form input and buttons
var addParticleButton = document.querySelector("#addParticle");
var clearParticlesButton = document.querySelector("#clearParticles");
var updateGroundNormalButton = document.querySelector("#updateGroundNormal");
var updateTimeStepButton = document.querySelector("#updateTimeStep");

addParticleButton.addEventListener("click", addParticleButtonHandler);
clearParticlesButton.addEventListener("click", clearParticlesButtonHandler);
updateGroundNormalButton.addEventListener("click", updateGroundNormalButtonHandler);
updateTimeStepButton.addEventListener("click", updateTimeStepButtonHandler);

function addParticleButtonHandler(event) {
	var x = document.querySelector("#xPosition").value;
	var y = document.querySelector("#yPosition").value;
	var vx = document.querySelector("#xVelocity").value;
	var vy = document.querySelector("#yVelocity").value;

	var p = [parseFloat(x), parseFloat(y)];
	var v = [parseFloat(vx), parseFloat(vy)];
	
	if (x < -1) {
		alert("x must be greater than -1 to be in bounds");
		return;
	};
	
	if (x > 1) {
		alert("x must be less than 1 to be in bounds");
		return;
	};
	
	if (y > 1) {
		alert("y must be less than 1 to be in bounds");
		return;
	};
	
	if (simulationData.ground[0]*p[0] + simulationData.ground[1]*p[1] < 0) {
		alert("point must be above the line " + simulationData.ground[0] + "x + " + simulationData.ground[1] + "y = 0");
		return;
	}
	
	simulationData.velocity.push(v);
	simulationData.position.push(p);
};

function clearParticlesButtonHandler(event) {
	simulationData.position = new Array();
	simulationData.velocity = new Array();
};

function updateGroundNormalButtonHandler(event) {
	var x = document.querySelector("#xGround").value;
	var y = document.querySelector("#yGround").value;
	
	if (y <=0) {
		alert("y must be positive");
		return;
	}
	
	if (y < Math.abs(x)) {
		alert("The simulation doesn't work well if the magnitude of x is greater than y");
		return;
	}

	simulationData.ground=[x,y];
	boundary = boundaryPoints();
};

function updateTimeStepButtonHandler(event) {
	var ts = document.querySelector("#timeStep").value;
	simulationData.dt=ts;
};

function updateForm(simulationData) {
	document.querySelector("#xPosition").value = 0.0;
	document.querySelector("#yPosition").value = 0.5;
	document.querySelector("#xVelocity").value = 0.2;
	document.querySelector("#yVelocity").value = 0.1;
	document.querySelector("#xGround").value = 0.0;
	document.querySelector("#yGround").value = 1.0;
	document.querySelector("#timeStep").value = 0.07;
};
	
