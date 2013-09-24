;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	

},{"./mysimulator.js":2}],2:[function(require,module,exports){
/*
Author: Michael Doescher
This module defines a function that integrates the state of a system forward in time by time step dt.
Framework provided in CS558 Assignment 1 Description by Mikola Lysenko
Created 9/11/2013
Modified 9/12/2013 to add reflection off of the ground line
Modified 9/13/2013 bug fixes
Note: this simulation assumes that the particles do not interact, that all particles begin within 
   bounds, and that the y component of the ground normal is positive.
Note: The simulation also does not yet allow for the particles to bounce off of multiple walls in one time step.
 */

module.exports = function(position, velocity, ground, dt) {
	var nextPosition = new Array(position.length)
	var nextVelocity = new Array(velocity.length)

  
  // Compute next state here
  for (var i = 0; i<position.length; i++) {
	nextPosition[i] = new Array(2);
	nextPosition[i][0] = position[i][0] + dt * velocity[i][0];
	nextPosition[i][1] = position[i][1] + dt * velocity[i][1];
	nextVelocity[i] = new Array(2);
	nextVelocity[i][0] = velocity[i][0];
	nextVelocity[i][1] = velocity[i][1];
	
	if (nextPosition[i][0] >= 1) {											// out of bounds right
		nextPosition[i][0] = (nextPosition[i][0]-1)*-1 + 1;
		nextVelocity[i][0] *= -1;
	}
	if (nextPosition[i][0] <= -1) {											// out of bounds left
		nextPosition[i][0] = (nextPosition[i][0]+1)*-1 -1;
		nextVelocity[i][0] *= -1;
	}
	if (nextPosition[i][1] >= 1) {											// out of bounds top
		nextPosition[i][1] = (nextPosition[i][1]-1)*-1 + 1;
		nextVelocity[i][1] *= -1;
	}
	if (ground[0]*nextPosition[i][0] + ground[1]*nextPosition[i][1] <0) {	// below ground
		// solve for intersection point
		
		//abbreviated variables to make the calculation of t easier to read
		var gx = ground[0];
		var gy = ground[1];
		var px = position[i][0];
		var py = position[i][1];
		var vx = velocity[i][0];
		var vy = velocity[i][1];
		
		// line 1 ==> gx * x + gy * y = 0
		// line 2 ==> p = position + t*velocity
		// gx*(position.X + t*velocity.X) + gy * (position.Y + t*velocity.Y) = 0
		var t = (-1)*(gx*px + gy*py) / (gx*vx + gy*vy);
				
		// the point of intersection
		var intersection = new Array(2);
		intersection[0] = position[i][0] + t*velocity[i][0];
		intersection[1] = position[i][1] + t*velocity[i][1];
		
		//update the velocity vector with the reflection vector
		var r = new Array(2);   // reflection
		var v = velocity[i];	// incident 
		var n = ground;			// normal
		
		// reflection vector
		r[0] = v[0] - 2 * ( (v[0]*n[0] + v[1]*n[1]) / (n[0]*n[0] + n[1]*n[1]) )* n[0];
		r[1] = v[1] - 2 * ( (v[0]*n[0] + v[1]*n[1]) / (n[0]*n[0] + n[1]*n[1]) )* n[1];
		nextVelocity[i] = r;
		
		// update position
		nextPosition[i][0] = intersection[0] + dt * nextVelocity[i][0] * (1-t);
		nextPosition[i][1] = intersection[1] + dt * nextVelocity[i][1] * (1-t);
		}
  }

  return {
    position: nextPosition,
    velocity: nextVelocity
  }
}
},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE1pa2VcXERlc2t0b3BcXENvbXBHZW9tXFxBc3NpZ25tZW50MVxcQXNzaWdubWVudDFcXFBhcnRpY2xlc0luQUJveC5qcyIsIkM6XFxVc2Vyc1xcTWlrZVxcRGVza3RvcFxcQ29tcEdlb21cXEFzc2lnbm1lbnQxXFxBc3NpZ25tZW50MVxcbXlzaW11bGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG5BdXRob3I6IE1pY2hhZWwgRG9lc2NoZXJcclxuVGhpcyBwcm9ncmFtIGltcGxlbWVudHMgdGhlIHBhcnRpY2xlcyBib3VuY2luZyBhcm91bmQgaW4gYSBib3ggYXMgYSBKYXZhU2NyaXB0IGFuaW1hdGlvblxyXG5GcmFtZXdvcmsgcHJvdmlkZWQgaW4gQ1M1NTggQXNzaWdubWVudCAxIGFuZCAyIERlc2NyaXB0aW9uIGJ5IE1pa29sYSBMeXNlbmtvXHJcbkNyZWF0ZWQgOS8xOS8yMDEzXHJcbiAqL1xyXG5cclxuXHJcbnZhciBzaW0gPSByZXF1aXJlKFwiLi9teXNpbXVsYXRvci5qc1wiKTtcclxudmFyIGNhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc1wiKTtcclxudmFyIGdjID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbnZhciBzaW11bGF0aW9uRGF0YSA9IGluaXQoKTtcclxudXBkYXRlRm9ybShzaW11bGF0aW9uRGF0YSk7XHJcbnNpbXVsYXRpb25EYXRhLmdyb3VuZCA9IFswLjIsIDEuMF07XHJcbnZhciBib3VuZGFyeSA9IGJvdW5kYXJ5UG9pbnRzKCk7XHJcblxyXG4vLyB3aGF0IGFyZSB0aGUgcGl4ZWwgc3BhY2UgY29vcmRpbmF0ZXMgb2YgWzAsMF0gYW5kIFsxLDFdXHJcbnZhciBjb29yZGluYXRlU3lzdGVtID0gW1tjYW52YXNFbGVtZW50LndpZHRoLzIsIGNhbnZhc0VsZW1lbnQuaGVpZ2h0LzJdLCBbY2FudmFzRWxlbWVudC53aWR0aC0xMCwgMTBdXTtcclxuXHJcbnNldEludGVydmFsKGZ1bmN0aW9uKCkge3VwZGF0ZVNpbXVsYXRpb24oZ2MsIHNpbXVsYXRpb25EYXRhLCBib3VuZGFyeSwgY29vcmRpbmF0ZVN5c3RlbSl9LCAzMCk7XHJcblxyXG5mdW5jdGlvbiBpbml0KCkge1xyXG5cdHJldHVybiB7XHJcblx0XHRwb3NpdGlvbiA6IFtbMC4wLCAwLjVdLCBbMC4wLCAwLjVdLCBbMC4wLDAuNV0sIFswLjAsIDAuNV0sIFstMC41LCAwLjVdXSxcclxuXHRcdHZlbG9jaXR5IDogW1swLjAsIDEuMF0sIFswLjAsIC0xLjBdLCBbLTIuMCwgMC4wXSwgWzIuMCwgMC4wXSwgWzEuMCwgLTEuMF1dLFxyXG5cdFx0Z3JvdW5kICAgOiBbMC4wLCAxLjBdLFxyXG5cdFx0ZHQgICAgICAgOiAwLjAyXHJcblx0fTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGJvdW5kYXJ5UG9pbnRzKCkge1xyXG5cdHZhciBncm91bmQgPSBzaW11bGF0aW9uRGF0YS5ncm91bmQ7XHJcblx0YnAgPSBuZXcgQXJyYXkoKTtcclxuXHRicC5wdXNoKFstMSwgMV0pO1xyXG5cdGJwLnB1c2goWzEsIDFdKTtcclxuXHRicC5wdXNoKGltcGxpY2l0TGluZUludGVyc2VjdGlvbihbZ3JvdW5kWzBdLCBncm91bmRbMV0sIDBdLCBbLTEsIDAsIDFdKSk7XHJcblx0YnAucHVzaChpbXBsaWNpdExpbmVJbnRlcnNlY3Rpb24oW2dyb3VuZFswXSwgZ3JvdW5kWzFdLCAwXSwgWzEsIDAsIDFdKSk7XHJcblx0cmV0dXJuIGJwO1xyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIGltcGxpY2l0TGluZUludGVyc2VjdGlvbihsaW5lMSwgbGluZTIpIHtcclxuXHR2YXIgYTEgPSBsaW5lMVswXTtcclxuXHR2YXIgYTIgPSBsaW5lMlswXTtcclxuXHR2YXIgYjEgPSBsaW5lMVsxXTtcclxuXHR2YXIgYjIgPSBsaW5lMlsxXTtcclxuXHR2YXIgYzEgPSBsaW5lMVsyXTtcclxuXHR2YXIgYzIgPSBsaW5lMlsyXTtcdFxyXG5cdFxyXG5cdGlmIChhMSA9PSAwICYmIGIxID09IDApIHJldHVybiBudWxsO1x0Ly8gbGluZTEgaXMgbm90IGEgbGluZVxyXG5cdGlmIChhMiA9PSAwICYmIGIyID09IDApIHJldHVybiBudWxsO1x0Ly8gbGluZTIgaXMgbm90IGEgbGluZVxyXG5cdGlmIChhMSA9PSAwICYmIGEyID09IDApIHJldHVybiBudWxsO1x0Ly8gcGFyYWxsZWxcclxuXHRpZiAoYjEgPT0gMCAmJiBiMiA9PSAwKSByZXR1cm4gbnVsbDtcdC8vIHBhcmFsbGVsXHJcblx0XHJcblx0aWYgKGExID09IDApIHsgXHRcdFx0XHRcdFx0XHQvLyBsaW5lIDEgaXMgaG9yaXpvbnRhbFxyXG5cdFx0dmFyIHkgPSAoLTEpKmMxL2IxO1xyXG5cdFx0cmV0dXJuIFsoLTEpKihiMip5K2MyKS9hMiwgeV07XHJcblx0fVx0XHJcblx0aWYgKGEyID09IDApIHtcdFx0XHRcdFx0XHRcdC8vIGxpbmUgMiBpcyBob3Jpem9udGFsXHJcblx0XHR2YXIgeSA9ICgtMSkqYzIvYjI7XHJcblx0XHRyZXR1cm4gWygtMSkqKGIxKnkrYzEpL2ExLCB5XTtcclxuXHR9XHJcblx0aWYgKGIxID09IDApIHtcdFx0XHRcdFx0XHRcdC8vIGxpbmUgMSBpcyB2ZXJ0aWNhbFxyXG5cdFx0dmFyIHggPSAoLTEpKmMxL2ExO1xyXG5cdFx0cmV0dXJuIFt4LCAoLTEpKihhMip4K2MyKS9iMl07XHJcblx0fVxyXG5cdGlmIChiMiA9PSAwKSB7XHRcdFx0XHRcdFx0XHQvLyBsaW5lIDIgaXMgdmVydGljYWxcclxuXHRcdHZhciB4ID0gKC0xKSpjMi9hMjtcclxuXHRcdHJldHVybiBbeCwgKC0xKSooYTEqeCtjMSkvYjFdO1xyXG5cdH1cclxuXHRpZiAoYTEvYjEgLSBhMi9iMiA8IDFlLTYgJiYgYTEvYjEgLSBhMi9iMiA+IC0xZS02KSByZXR1cm4gbnVsbDtcdFx0Ly8gcGFyYWxsZWxcclxuXHRcclxuXHR2YXIgeCA9ICgtMSkgKiAoYzItYzEqYjIvYjEpIC8gKGEyLWExKmIyL2IxKVx0Ly8gZ2VuZXJhbCBsaW5lc1xyXG5cdHJldHVybiBbeCwgKC0xKSooYzErYTEqeCkgLyBiMV07XHJcbn07XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTaW11bGF0aW9uKGdjLCBzZCwgYm91bmRhcnksIGNvb3JkaW5hdGVTeXN0ZW0pIHtcclxuXHR2YXIgbmV4dFN0YXRlID0gc2ltKHNkLnBvc2l0aW9uLCBzZC52ZWxvY2l0eSwgc2QuZ3JvdW5kLCBzZC5kdCk7XHJcblx0c2QucG9zaXRpb24gPSBuZXh0U3RhdGUucG9zaXRpb247XHJcblx0c2QudmVsb2NpdHkgPSBuZXh0U3RhdGUudmVsb2NpdHk7XHJcblxyXG5cdGRyYXcoZ2MsIHNkLCBib3VuZGFyeSwgY29vcmRpbmF0ZVN5c3RlbSk7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZHJhdyhnYywgc2QsIGJvdW5kYXJ5LCBjb29yZGluYXRlU3lzdGVtKSB7XHJcblx0Ly8gY2xlYXIgdGhlIGNhbnZhcyAtIChjb2xvciB0aGUgZW50aXJlIGNhbnZhcyByZWQpXHJcblx0Z2MuZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCAwLCAwKVwiO1xyXG5cdGdjLmZpbGxSZWN0KDAsIDAsIGNhbnZhc0VsZW1lbnQud2lkdGgsIGNhbnZhc0VsZW1lbnQuaGVpZ2h0KTtcdFxyXG5cdFxyXG5cdC8vIGRyYXcgJ2JveCcgY29udGFpbmluZyBwYXJ0aWNsZXNcclxuXHRnYy5maWxsU3R5bGUgPSBcInJnYigyNTUsIDI1NSwgMClcIjsgLy8gd2hpdGUgYm94XHJcblx0Z2MuYmVnaW5QYXRoKCk7IFxyXG5cdHZhciBwID0gdG9DYW52YXNDb29yZGluYXRlcyhib3VuZGFyeVswXSwgY29vcmRpbmF0ZVN5c3RlbSk7XHJcblx0XHJcblx0Z2MubW92ZVRvKHBbMF0sIHBbMV0pO1xyXG5cdGZvciAodmFyIGkgPSAxOyBpPGJvdW5kYXJ5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRwID0gdG9DYW52YXNDb29yZGluYXRlcyhib3VuZGFyeVtpXSwgY29vcmRpbmF0ZVN5c3RlbSk7XHJcblx0XHRnYy5saW5lVG8ocFswXSwgcFsxXSk7XHJcblx0fVxyXG5cdGdjLmNsb3NlUGF0aCgpO1xyXG5cdGdjLmZpbGwoKTtcdFxyXG5cclxuXHQvLyBkcmF3IHBhcnRpY2xlc1xyXG5cdGdjLmZpbGxTdHlsZSA9IFwicmdiKDAsIDI1NSwgMClcIjtcclxuXHRmb3IgKHZhciBpID0gMDsgaTxzZC5wb3NpdGlvbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0cCA9IHRvQ2FudmFzQ29vcmRpbmF0ZXMoc2QucG9zaXRpb25baV0sIGNvb3JkaW5hdGVTeXN0ZW0pO1xyXG5cdFx0Z2MuYmVnaW5QYXRoKCk7XHJcblx0XHRnYy5tb3ZlVG8ocFswXSwgcFsxXSk7XHJcblx0XHRnYy5hcmMocFswXSwgcFsxXSwgNCwgMCwgMipNYXRoLlBJLCB0cnVlKTtcclxuXHRcdGdjLmNsb3NlUGF0aCgpO1xyXG5cdFx0Z2MuZmlsbCgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vIHdoYXQgYXJlIHRoZSBwaXhlbCBzcGFjZSBjb29yZGluYXRlcyBvZiBbMCwwXSBhbmQgWzEsMV1cclxuLy8gdmFyIGNvb3JkaW5hdGVTeXN0ZW0gPSBbW2NhbnZhc0VsZW1lbnQud2lkdGgvMiwgY2FudmFzRWxlbWVudC5oZWlnaHQvMl0sIFtjYW52YXNFbGVtZW50LndpZHRoLTEwLCAxMF1dO1xyXG5cclxuZnVuY3Rpb24gdG9DYW52YXNDb29yZGluYXRlcyhwb2ludCwgY29vcmRpbmF0ZVN5c3RlbSkge1xyXG5cdHZhciBwID0gbmV3IEFycmF5KDIpO1xyXG5cdGZvciAodmFyIGkgPSAwOyBpPDI7IGkrKykge1xyXG5cdFx0cFtpXSA9IHBvaW50W2ldKiAoY29vcmRpbmF0ZVN5c3RlbVsxXVtpXSAtIGNvb3JkaW5hdGVTeXN0ZW1bMF1baV0pICsgY29vcmRpbmF0ZVN5c3RlbVswXVtpXVxyXG5cdH1cclxuXHRyZXR1cm4gcDtcclxufVxyXG5cclxuXHJcbi8vIGJlbG93IGlzIHRoZSBjb2RlIHRoYXQgcnVucyB0aGUgZm9ybSBpbnB1dCBhbmQgYnV0dG9uc1xyXG52YXIgYWRkUGFydGljbGVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FkZFBhcnRpY2xlXCIpO1xyXG52YXIgY2xlYXJQYXJ0aWNsZXNCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NsZWFyUGFydGljbGVzXCIpO1xyXG52YXIgdXBkYXRlR3JvdW5kTm9ybWFsQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1cGRhdGVHcm91bmROb3JtYWxcIik7XHJcbnZhciB1cGRhdGVUaW1lU3RlcEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdXBkYXRlVGltZVN0ZXBcIik7XHJcblxyXG5hZGRQYXJ0aWNsZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYWRkUGFydGljbGVCdXR0b25IYW5kbGVyKTtcclxuY2xlYXJQYXJ0aWNsZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsZWFyUGFydGljbGVzQnV0dG9uSGFuZGxlcik7XHJcbnVwZGF0ZUdyb3VuZE5vcm1hbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdXBkYXRlR3JvdW5kTm9ybWFsQnV0dG9uSGFuZGxlcik7XHJcbnVwZGF0ZVRpbWVTdGVwQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB1cGRhdGVUaW1lU3RlcEJ1dHRvbkhhbmRsZXIpO1xyXG5cclxuZnVuY3Rpb24gYWRkUGFydGljbGVCdXR0b25IYW5kbGVyKGV2ZW50KSB7XHJcblx0dmFyIHggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3hQb3NpdGlvblwiKS52YWx1ZTtcclxuXHR2YXIgeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeVBvc2l0aW9uXCIpLnZhbHVlO1xyXG5cdHZhciB2eCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeFZlbG9jaXR5XCIpLnZhbHVlO1xyXG5cdHZhciB2eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeVZlbG9jaXR5XCIpLnZhbHVlO1xyXG5cclxuXHR2YXIgcCA9IFtwYXJzZUZsb2F0KHgpLCBwYXJzZUZsb2F0KHkpXTtcclxuXHR2YXIgdiA9IFtwYXJzZUZsb2F0KHZ4KSwgcGFyc2VGbG9hdCh2eSldO1xyXG5cdFxyXG5cdGlmICh4IDwgLTEpIHtcclxuXHRcdGFsZXJ0KFwieCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAtMSB0byBiZSBpbiBib3VuZHNcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fTtcclxuXHRcclxuXHRpZiAoeCA+IDEpIHtcclxuXHRcdGFsZXJ0KFwieCBtdXN0IGJlIGxlc3MgdGhhbiAxIHRvIGJlIGluIGJvdW5kc1wiKTtcclxuXHRcdHJldHVybjtcclxuXHR9O1xyXG5cdFxyXG5cdGlmICh5ID4gMSkge1xyXG5cdFx0YWxlcnQoXCJ5IG11c3QgYmUgbGVzcyB0aGFuIDEgdG8gYmUgaW4gYm91bmRzXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH07XHJcblx0XHJcblx0aWYgKHNpbXVsYXRpb25EYXRhLmdyb3VuZFswXSpwWzBdICsgc2ltdWxhdGlvbkRhdGEuZ3JvdW5kWzFdKnBbMV0gPCAwKSB7XHJcblx0XHRhbGVydChcInBvaW50IG11c3QgYmUgYWJvdmUgdGhlIGxpbmUgXCIgKyBzaW11bGF0aW9uRGF0YS5ncm91bmRbMF0gKyBcInggKyBcIiArIHNpbXVsYXRpb25EYXRhLmdyb3VuZFsxXSArIFwieSA9IDBcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdHNpbXVsYXRpb25EYXRhLnZlbG9jaXR5LnB1c2godik7XHJcblx0c2ltdWxhdGlvbkRhdGEucG9zaXRpb24ucHVzaChwKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNsZWFyUGFydGljbGVzQnV0dG9uSGFuZGxlcihldmVudCkge1xyXG5cdHNpbXVsYXRpb25EYXRhLnBvc2l0aW9uID0gbmV3IEFycmF5KCk7XHJcblx0c2ltdWxhdGlvbkRhdGEudmVsb2NpdHkgPSBuZXcgQXJyYXkoKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUdyb3VuZE5vcm1hbEJ1dHRvbkhhbmRsZXIoZXZlbnQpIHtcclxuXHR2YXIgeCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeEdyb3VuZFwiKS52YWx1ZTtcclxuXHR2YXIgeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeUdyb3VuZFwiKS52YWx1ZTtcclxuXHRcclxuXHRpZiAoeSA8PTApIHtcclxuXHRcdGFsZXJ0KFwieSBtdXN0IGJlIHBvc2l0aXZlXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRpZiAoeSA8IE1hdGguYWJzKHgpKSB7XHJcblx0XHRhbGVydChcIlRoZSBzaW11bGF0aW9uIGRvZXNuJ3Qgd29yayB3ZWxsIGlmIHRoZSBtYWduaXR1ZGUgb2YgeCBpcyBncmVhdGVyIHRoYW4geVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdHNpbXVsYXRpb25EYXRhLmdyb3VuZD1beCx5XTtcclxuXHRib3VuZGFyeSA9IGJvdW5kYXJ5UG9pbnRzKCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVUaW1lU3RlcEJ1dHRvbkhhbmRsZXIoZXZlbnQpIHtcclxuXHR2YXIgdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVTdGVwXCIpLnZhbHVlO1xyXG5cdHNpbXVsYXRpb25EYXRhLmR0PXRzO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlRm9ybShzaW11bGF0aW9uRGF0YSkge1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeFBvc2l0aW9uXCIpLnZhbHVlID0gMC4wO1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeVBvc2l0aW9uXCIpLnZhbHVlID0gMC41O1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeFZlbG9jaXR5XCIpLnZhbHVlID0gMC4yO1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeVZlbG9jaXR5XCIpLnZhbHVlID0gMC4xO1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjeEdyb3VuZFwiKS52YWx1ZSA9IDAuMDtcclxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3lHcm91bmRcIikudmFsdWUgPSAxLjA7XHJcblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lU3RlcFwiKS52YWx1ZSA9IDAuMDc7XHJcbn07XHJcblx0XHJcbiIsIi8qXHJcbkF1dGhvcjogTWljaGFlbCBEb2VzY2hlclxyXG5UaGlzIG1vZHVsZSBkZWZpbmVzIGEgZnVuY3Rpb24gdGhhdCBpbnRlZ3JhdGVzIHRoZSBzdGF0ZSBvZiBhIHN5c3RlbSBmb3J3YXJkIGluIHRpbWUgYnkgdGltZSBzdGVwIGR0LlxyXG5GcmFtZXdvcmsgcHJvdmlkZWQgaW4gQ1M1NTggQXNzaWdubWVudCAxIERlc2NyaXB0aW9uIGJ5IE1pa29sYSBMeXNlbmtvXHJcbkNyZWF0ZWQgOS8xMS8yMDEzXHJcbk1vZGlmaWVkIDkvMTIvMjAxMyB0byBhZGQgcmVmbGVjdGlvbiBvZmYgb2YgdGhlIGdyb3VuZCBsaW5lXHJcbk1vZGlmaWVkIDkvMTMvMjAxMyBidWcgZml4ZXNcclxuTm90ZTogdGhpcyBzaW11bGF0aW9uIGFzc3VtZXMgdGhhdCB0aGUgcGFydGljbGVzIGRvIG5vdCBpbnRlcmFjdCwgdGhhdCBhbGwgcGFydGljbGVzIGJlZ2luIHdpdGhpbiBcclxuICAgYm91bmRzLCBhbmQgdGhhdCB0aGUgeSBjb21wb25lbnQgb2YgdGhlIGdyb3VuZCBub3JtYWwgaXMgcG9zaXRpdmUuXHJcbk5vdGU6IFRoZSBzaW11bGF0aW9uIGFsc28gZG9lcyBub3QgeWV0IGFsbG93IGZvciB0aGUgcGFydGljbGVzIHRvIGJvdW5jZSBvZmYgb2YgbXVsdGlwbGUgd2FsbHMgaW4gb25lIHRpbWUgc3RlcC5cclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBvc2l0aW9uLCB2ZWxvY2l0eSwgZ3JvdW5kLCBkdCkge1xyXG5cdHZhciBuZXh0UG9zaXRpb24gPSBuZXcgQXJyYXkocG9zaXRpb24ubGVuZ3RoKVxyXG5cdHZhciBuZXh0VmVsb2NpdHkgPSBuZXcgQXJyYXkodmVsb2NpdHkubGVuZ3RoKVxyXG5cclxuICBcclxuICAvLyBDb21wdXRlIG5leHQgc3RhdGUgaGVyZVxyXG4gIGZvciAodmFyIGkgPSAwOyBpPHBvc2l0aW9uLmxlbmd0aDsgaSsrKSB7XHJcblx0bmV4dFBvc2l0aW9uW2ldID0gbmV3IEFycmF5KDIpO1xyXG5cdG5leHRQb3NpdGlvbltpXVswXSA9IHBvc2l0aW9uW2ldWzBdICsgZHQgKiB2ZWxvY2l0eVtpXVswXTtcclxuXHRuZXh0UG9zaXRpb25baV1bMV0gPSBwb3NpdGlvbltpXVsxXSArIGR0ICogdmVsb2NpdHlbaV1bMV07XHJcblx0bmV4dFZlbG9jaXR5W2ldID0gbmV3IEFycmF5KDIpO1xyXG5cdG5leHRWZWxvY2l0eVtpXVswXSA9IHZlbG9jaXR5W2ldWzBdO1xyXG5cdG5leHRWZWxvY2l0eVtpXVsxXSA9IHZlbG9jaXR5W2ldWzFdO1xyXG5cdFxyXG5cdGlmIChuZXh0UG9zaXRpb25baV1bMF0gPj0gMSkge1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBvdXQgb2YgYm91bmRzIHJpZ2h0XHJcblx0XHRuZXh0UG9zaXRpb25baV1bMF0gPSAobmV4dFBvc2l0aW9uW2ldWzBdLTEpKi0xICsgMTtcclxuXHRcdG5leHRWZWxvY2l0eVtpXVswXSAqPSAtMTtcclxuXHR9XHJcblx0aWYgKG5leHRQb3NpdGlvbltpXVswXSA8PSAtMSkge1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBvdXQgb2YgYm91bmRzIGxlZnRcclxuXHRcdG5leHRQb3NpdGlvbltpXVswXSA9IChuZXh0UG9zaXRpb25baV1bMF0rMSkqLTEgLTE7XHJcblx0XHRuZXh0VmVsb2NpdHlbaV1bMF0gKj0gLTE7XHJcblx0fVxyXG5cdGlmIChuZXh0UG9zaXRpb25baV1bMV0gPj0gMSkge1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBvdXQgb2YgYm91bmRzIHRvcFxyXG5cdFx0bmV4dFBvc2l0aW9uW2ldWzFdID0gKG5leHRQb3NpdGlvbltpXVsxXS0xKSotMSArIDE7XHJcblx0XHRuZXh0VmVsb2NpdHlbaV1bMV0gKj0gLTE7XHJcblx0fVxyXG5cdGlmIChncm91bmRbMF0qbmV4dFBvc2l0aW9uW2ldWzBdICsgZ3JvdW5kWzFdKm5leHRQb3NpdGlvbltpXVsxXSA8MCkge1x0Ly8gYmVsb3cgZ3JvdW5kXHJcblx0XHQvLyBzb2x2ZSBmb3IgaW50ZXJzZWN0aW9uIHBvaW50XHJcblx0XHRcclxuXHRcdC8vYWJicmV2aWF0ZWQgdmFyaWFibGVzIHRvIG1ha2UgdGhlIGNhbGN1bGF0aW9uIG9mIHQgZWFzaWVyIHRvIHJlYWRcclxuXHRcdHZhciBneCA9IGdyb3VuZFswXTtcclxuXHRcdHZhciBneSA9IGdyb3VuZFsxXTtcclxuXHRcdHZhciBweCA9IHBvc2l0aW9uW2ldWzBdO1xyXG5cdFx0dmFyIHB5ID0gcG9zaXRpb25baV1bMV07XHJcblx0XHR2YXIgdnggPSB2ZWxvY2l0eVtpXVswXTtcclxuXHRcdHZhciB2eSA9IHZlbG9jaXR5W2ldWzFdO1xyXG5cdFx0XHJcblx0XHQvLyBsaW5lIDEgPT0+IGd4ICogeCArIGd5ICogeSA9IDBcclxuXHRcdC8vIGxpbmUgMiA9PT4gcCA9IHBvc2l0aW9uICsgdCp2ZWxvY2l0eVxyXG5cdFx0Ly8gZ3gqKHBvc2l0aW9uLlggKyB0KnZlbG9jaXR5LlgpICsgZ3kgKiAocG9zaXRpb24uWSArIHQqdmVsb2NpdHkuWSkgPSAwXHJcblx0XHR2YXIgdCA9ICgtMSkqKGd4KnB4ICsgZ3kqcHkpIC8gKGd4KnZ4ICsgZ3kqdnkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gdGhlIHBvaW50IG9mIGludGVyc2VjdGlvblxyXG5cdFx0dmFyIGludGVyc2VjdGlvbiA9IG5ldyBBcnJheSgyKTtcclxuXHRcdGludGVyc2VjdGlvblswXSA9IHBvc2l0aW9uW2ldWzBdICsgdCp2ZWxvY2l0eVtpXVswXTtcclxuXHRcdGludGVyc2VjdGlvblsxXSA9IHBvc2l0aW9uW2ldWzFdICsgdCp2ZWxvY2l0eVtpXVsxXTtcclxuXHRcdFxyXG5cdFx0Ly91cGRhdGUgdGhlIHZlbG9jaXR5IHZlY3RvciB3aXRoIHRoZSByZWZsZWN0aW9uIHZlY3RvclxyXG5cdFx0dmFyIHIgPSBuZXcgQXJyYXkoMik7ICAgLy8gcmVmbGVjdGlvblxyXG5cdFx0dmFyIHYgPSB2ZWxvY2l0eVtpXTtcdC8vIGluY2lkZW50IFxyXG5cdFx0dmFyIG4gPSBncm91bmQ7XHRcdFx0Ly8gbm9ybWFsXHJcblx0XHRcclxuXHRcdC8vIHJlZmxlY3Rpb24gdmVjdG9yXHJcblx0XHRyWzBdID0gdlswXSAtIDIgKiAoICh2WzBdKm5bMF0gKyB2WzFdKm5bMV0pIC8gKG5bMF0qblswXSArIG5bMV0qblsxXSkgKSogblswXTtcclxuXHRcdHJbMV0gPSB2WzFdIC0gMiAqICggKHZbMF0qblswXSArIHZbMV0qblsxXSkgLyAoblswXSpuWzBdICsgblsxXSpuWzFdKSApKiBuWzFdO1xyXG5cdFx0bmV4dFZlbG9jaXR5W2ldID0gcjtcclxuXHRcdFxyXG5cdFx0Ly8gdXBkYXRlIHBvc2l0aW9uXHJcblx0XHRuZXh0UG9zaXRpb25baV1bMF0gPSBpbnRlcnNlY3Rpb25bMF0gKyBkdCAqIG5leHRWZWxvY2l0eVtpXVswXSAqICgxLXQpO1xyXG5cdFx0bmV4dFBvc2l0aW9uW2ldWzFdID0gaW50ZXJzZWN0aW9uWzFdICsgZHQgKiBuZXh0VmVsb2NpdHlbaV1bMV0gKiAoMS10KTtcclxuXHRcdH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwb3NpdGlvbjogbmV4dFBvc2l0aW9uLFxyXG4gICAgdmVsb2NpdHk6IG5leHRWZWxvY2l0eVxyXG4gIH1cclxufSJdfQ==
;