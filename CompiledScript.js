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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXE1pa2VcXENvbXBHZW9tXFxBc3NpZ25tZW50MVxcUGFydGljbGVzSW5BQm94LmpzIiwiQzpcXFVzZXJzXFxNaWtlXFxDb21wR2VvbVxcQXNzaWdubWVudDFcXG15c2ltdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuQXV0aG9yOiBNaWNoYWVsIERvZXNjaGVyXHJcblRoaXMgcHJvZ3JhbSBpbXBsZW1lbnRzIHRoZSBwYXJ0aWNsZXMgYm91bmNpbmcgYXJvdW5kIGluIGEgYm94IGFzIGEgSmF2YVNjcmlwdCBhbmltYXRpb25cclxuRnJhbWV3b3JrIHByb3ZpZGVkIGluIENTNTU4IEFzc2lnbm1lbnQgMSBhbmQgMiBEZXNjcmlwdGlvbiBieSBNaWtvbGEgTHlzZW5rb1xyXG5DcmVhdGVkIDkvMTkvMjAxM1xyXG4gKi9cclxuXHJcblxyXG52YXIgc2ltID0gcmVxdWlyZShcIi4vbXlzaW11bGF0b3IuanNcIik7XHJcbnZhciBjYW52YXNFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNcIik7XHJcbnZhciBnYyA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG52YXIgc2ltdWxhdGlvbkRhdGEgPSBpbml0KCk7XHJcbnVwZGF0ZUZvcm0oc2ltdWxhdGlvbkRhdGEpO1xyXG5zaW11bGF0aW9uRGF0YS5ncm91bmQgPSBbMC4yLCAxLjBdO1xyXG52YXIgYm91bmRhcnkgPSBib3VuZGFyeVBvaW50cygpO1xyXG5cclxuLy8gd2hhdCBhcmUgdGhlIHBpeGVsIHNwYWNlIGNvb3JkaW5hdGVzIG9mIFswLDBdIGFuZCBbMSwxXVxyXG52YXIgY29vcmRpbmF0ZVN5c3RlbSA9IFtbY2FudmFzRWxlbWVudC53aWR0aC8yLCBjYW52YXNFbGVtZW50LmhlaWdodC8yXSwgW2NhbnZhc0VsZW1lbnQud2lkdGgtMTAsIDEwXV07XHJcblxyXG5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHt1cGRhdGVTaW11bGF0aW9uKGdjLCBzaW11bGF0aW9uRGF0YSwgYm91bmRhcnksIGNvb3JkaW5hdGVTeXN0ZW0pfSwgMzApO1xyXG5cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0cG9zaXRpb24gOiBbWzAuMCwgMC41XSwgWzAuMCwgMC41XSwgWzAuMCwwLjVdLCBbMC4wLCAwLjVdLCBbLTAuNSwgMC41XV0sXHJcblx0XHR2ZWxvY2l0eSA6IFtbMC4wLCAxLjBdLCBbMC4wLCAtMS4wXSwgWy0yLjAsIDAuMF0sIFsyLjAsIDAuMF0sIFsxLjAsIC0xLjBdXSxcclxuXHRcdGdyb3VuZCAgIDogWzAuMCwgMS4wXSxcclxuXHRcdGR0ICAgICAgIDogMC4wMlxyXG5cdH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBib3VuZGFyeVBvaW50cygpIHtcclxuXHR2YXIgZ3JvdW5kID0gc2ltdWxhdGlvbkRhdGEuZ3JvdW5kO1xyXG5cdGJwID0gbmV3IEFycmF5KCk7XHJcblx0YnAucHVzaChbLTEsIDFdKTtcclxuXHRicC5wdXNoKFsxLCAxXSk7XHJcblx0YnAucHVzaChpbXBsaWNpdExpbmVJbnRlcnNlY3Rpb24oW2dyb3VuZFswXSwgZ3JvdW5kWzFdLCAwXSwgWy0xLCAwLCAxXSkpO1xyXG5cdGJwLnB1c2goaW1wbGljaXRMaW5lSW50ZXJzZWN0aW9uKFtncm91bmRbMF0sIGdyb3VuZFsxXSwgMF0sIFsxLCAwLCAxXSkpO1xyXG5cdHJldHVybiBicDtcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBpbXBsaWNpdExpbmVJbnRlcnNlY3Rpb24obGluZTEsIGxpbmUyKSB7XHJcblx0dmFyIGExID0gbGluZTFbMF07XHJcblx0dmFyIGEyID0gbGluZTJbMF07XHJcblx0dmFyIGIxID0gbGluZTFbMV07XHJcblx0dmFyIGIyID0gbGluZTJbMV07XHJcblx0dmFyIGMxID0gbGluZTFbMl07XHJcblx0dmFyIGMyID0gbGluZTJbMl07XHRcclxuXHRcclxuXHRpZiAoYTEgPT0gMCAmJiBiMSA9PSAwKSByZXR1cm4gbnVsbDtcdC8vIGxpbmUxIGlzIG5vdCBhIGxpbmVcclxuXHRpZiAoYTIgPT0gMCAmJiBiMiA9PSAwKSByZXR1cm4gbnVsbDtcdC8vIGxpbmUyIGlzIG5vdCBhIGxpbmVcclxuXHRpZiAoYTEgPT0gMCAmJiBhMiA9PSAwKSByZXR1cm4gbnVsbDtcdC8vIHBhcmFsbGVsXHJcblx0aWYgKGIxID09IDAgJiYgYjIgPT0gMCkgcmV0dXJuIG51bGw7XHQvLyBwYXJhbGxlbFxyXG5cdFxyXG5cdGlmIChhMSA9PSAwKSB7IFx0XHRcdFx0XHRcdFx0Ly8gbGluZSAxIGlzIGhvcml6b250YWxcclxuXHRcdHZhciB5ID0gKC0xKSpjMS9iMTtcclxuXHRcdHJldHVybiBbKC0xKSooYjIqeStjMikvYTIsIHldO1xyXG5cdH1cdFxyXG5cdGlmIChhMiA9PSAwKSB7XHRcdFx0XHRcdFx0XHQvLyBsaW5lIDIgaXMgaG9yaXpvbnRhbFxyXG5cdFx0dmFyIHkgPSAoLTEpKmMyL2IyO1xyXG5cdFx0cmV0dXJuIFsoLTEpKihiMSp5K2MxKS9hMSwgeV07XHJcblx0fVxyXG5cdGlmIChiMSA9PSAwKSB7XHRcdFx0XHRcdFx0XHQvLyBsaW5lIDEgaXMgdmVydGljYWxcclxuXHRcdHZhciB4ID0gKC0xKSpjMS9hMTtcclxuXHRcdHJldHVybiBbeCwgKC0xKSooYTIqeCtjMikvYjJdO1xyXG5cdH1cclxuXHRpZiAoYjIgPT0gMCkge1x0XHRcdFx0XHRcdFx0Ly8gbGluZSAyIGlzIHZlcnRpY2FsXHJcblx0XHR2YXIgeCA9ICgtMSkqYzIvYTI7XHJcblx0XHRyZXR1cm4gW3gsICgtMSkqKGExKngrYzEpL2IxXTtcclxuXHR9XHJcblx0aWYgKGExL2IxIC0gYTIvYjIgPCAxZS02ICYmIGExL2IxIC0gYTIvYjIgPiAtMWUtNikgcmV0dXJuIG51bGw7XHRcdC8vIHBhcmFsbGVsXHJcblx0XHJcblx0dmFyIHggPSAoLTEpICogKGMyLWMxKmIyL2IxKSAvIChhMi1hMSpiMi9iMSlcdC8vIGdlbmVyYWwgbGluZXNcclxuXHRyZXR1cm4gW3gsICgtMSkqKGMxK2ExKngpIC8gYjFdO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlU2ltdWxhdGlvbihnYywgc2QsIGJvdW5kYXJ5LCBjb29yZGluYXRlU3lzdGVtKSB7XHJcblx0dmFyIG5leHRTdGF0ZSA9IHNpbShzZC5wb3NpdGlvbiwgc2QudmVsb2NpdHksIHNkLmdyb3VuZCwgc2QuZHQpO1xyXG5cdHNkLnBvc2l0aW9uID0gbmV4dFN0YXRlLnBvc2l0aW9uO1xyXG5cdHNkLnZlbG9jaXR5ID0gbmV4dFN0YXRlLnZlbG9jaXR5O1xyXG5cclxuXHRkcmF3KGdjLCBzZCwgYm91bmRhcnksIGNvb3JkaW5hdGVTeXN0ZW0pO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGRyYXcoZ2MsIHNkLCBib3VuZGFyeSwgY29vcmRpbmF0ZVN5c3RlbSkge1xyXG5cdC8vIGNsZWFyIHRoZSBjYW52YXMgLSAoY29sb3IgdGhlIGVudGlyZSBjYW52YXMgcmVkKVxyXG5cdGdjLmZpbGxTdHlsZSA9IFwicmdiKDI1NSwgMCwgMClcIjtcclxuXHRnYy5maWxsUmVjdCgwLCAwLCBjYW52YXNFbGVtZW50LndpZHRoLCBjYW52YXNFbGVtZW50LmhlaWdodCk7XHRcclxuXHRcclxuXHQvLyBkcmF3ICdib3gnIGNvbnRhaW5pbmcgcGFydGljbGVzXHJcblx0Z2MuZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCAyNTUsIDApXCI7IC8vIHdoaXRlIGJveFxyXG5cdGdjLmJlZ2luUGF0aCgpOyBcclxuXHR2YXIgcCA9IHRvQ2FudmFzQ29vcmRpbmF0ZXMoYm91bmRhcnlbMF0sIGNvb3JkaW5hdGVTeXN0ZW0pO1xyXG5cdFxyXG5cdGdjLm1vdmVUbyhwWzBdLCBwWzFdKTtcclxuXHRmb3IgKHZhciBpID0gMTsgaTxib3VuZGFyeS5sZW5ndGg7IGkrKykge1xyXG5cdFx0cCA9IHRvQ2FudmFzQ29vcmRpbmF0ZXMoYm91bmRhcnlbaV0sIGNvb3JkaW5hdGVTeXN0ZW0pO1xyXG5cdFx0Z2MubGluZVRvKHBbMF0sIHBbMV0pO1xyXG5cdH1cclxuXHRnYy5jbG9zZVBhdGgoKTtcclxuXHRnYy5maWxsKCk7XHRcclxuXHJcblx0Ly8gZHJhdyBwYXJ0aWNsZXNcclxuXHRnYy5maWxsU3R5bGUgPSBcInJnYigwLCAyNTUsIDApXCI7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGk8c2QucG9zaXRpb24ubGVuZ3RoOyBpKyspIHtcclxuXHRcdHAgPSB0b0NhbnZhc0Nvb3JkaW5hdGVzKHNkLnBvc2l0aW9uW2ldLCBjb29yZGluYXRlU3lzdGVtKTtcclxuXHRcdGdjLmJlZ2luUGF0aCgpO1xyXG5cdFx0Z2MubW92ZVRvKHBbMF0sIHBbMV0pO1xyXG5cdFx0Z2MuYXJjKHBbMF0sIHBbMV0sIDQsIDAsIDIqTWF0aC5QSSwgdHJ1ZSk7XHJcblx0XHRnYy5jbG9zZVBhdGgoKTtcclxuXHRcdGdjLmZpbGwoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vLyB3aGF0IGFyZSB0aGUgcGl4ZWwgc3BhY2UgY29vcmRpbmF0ZXMgb2YgWzAsMF0gYW5kIFsxLDFdXHJcbi8vIHZhciBjb29yZGluYXRlU3lzdGVtID0gW1tjYW52YXNFbGVtZW50LndpZHRoLzIsIGNhbnZhc0VsZW1lbnQuaGVpZ2h0LzJdLCBbY2FudmFzRWxlbWVudC53aWR0aC0xMCwgMTBdXTtcclxuXHJcbmZ1bmN0aW9uIHRvQ2FudmFzQ29vcmRpbmF0ZXMocG9pbnQsIGNvb3JkaW5hdGVTeXN0ZW0pIHtcclxuXHR2YXIgcCA9IG5ldyBBcnJheSgyKTtcclxuXHRmb3IgKHZhciBpID0gMDsgaTwyOyBpKyspIHtcclxuXHRcdHBbaV0gPSBwb2ludFtpXSogKGNvb3JkaW5hdGVTeXN0ZW1bMV1baV0gLSBjb29yZGluYXRlU3lzdGVtWzBdW2ldKSArIGNvb3JkaW5hdGVTeXN0ZW1bMF1baV1cclxuXHR9XHJcblx0cmV0dXJuIHA7XHJcbn1cclxuXHJcblxyXG4vLyBiZWxvdyBpcyB0aGUgY29kZSB0aGF0IHJ1bnMgdGhlIGZvcm0gaW5wdXQgYW5kIGJ1dHRvbnNcclxudmFyIGFkZFBhcnRpY2xlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhZGRQYXJ0aWNsZVwiKTtcclxudmFyIGNsZWFyUGFydGljbGVzQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbGVhclBhcnRpY2xlc1wiKTtcclxudmFyIHVwZGF0ZUdyb3VuZE5vcm1hbEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdXBkYXRlR3JvdW5kTm9ybWFsXCIpO1xyXG52YXIgdXBkYXRlVGltZVN0ZXBCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3VwZGF0ZVRpbWVTdGVwXCIpO1xyXG5cclxuYWRkUGFydGljbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFkZFBhcnRpY2xlQnV0dG9uSGFuZGxlcik7XHJcbmNsZWFyUGFydGljbGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGVhclBhcnRpY2xlc0J1dHRvbkhhbmRsZXIpO1xyXG51cGRhdGVHcm91bmROb3JtYWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHVwZGF0ZUdyb3VuZE5vcm1hbEJ1dHRvbkhhbmRsZXIpO1xyXG51cGRhdGVUaW1lU3RlcEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdXBkYXRlVGltZVN0ZXBCdXR0b25IYW5kbGVyKTtcclxuXHJcbmZ1bmN0aW9uIGFkZFBhcnRpY2xlQnV0dG9uSGFuZGxlcihldmVudCkge1xyXG5cdHZhciB4ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN4UG9zaXRpb25cIikudmFsdWU7XHJcblx0dmFyIHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3lQb3NpdGlvblwiKS52YWx1ZTtcclxuXHR2YXIgdnggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3hWZWxvY2l0eVwiKS52YWx1ZTtcclxuXHR2YXIgdnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3lWZWxvY2l0eVwiKS52YWx1ZTtcclxuXHJcblx0dmFyIHAgPSBbcGFyc2VGbG9hdCh4KSwgcGFyc2VGbG9hdCh5KV07XHJcblx0dmFyIHYgPSBbcGFyc2VGbG9hdCh2eCksIHBhcnNlRmxvYXQodnkpXTtcclxuXHRcclxuXHRpZiAoeCA8IC0xKSB7XHJcblx0XHRhbGVydChcInggbXVzdCBiZSBncmVhdGVyIHRoYW4gLTEgdG8gYmUgaW4gYm91bmRzXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH07XHJcblx0XHJcblx0aWYgKHggPiAxKSB7XHJcblx0XHRhbGVydChcInggbXVzdCBiZSBsZXNzIHRoYW4gMSB0byBiZSBpbiBib3VuZHNcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fTtcclxuXHRcclxuXHRpZiAoeSA+IDEpIHtcclxuXHRcdGFsZXJ0KFwieSBtdXN0IGJlIGxlc3MgdGhhbiAxIHRvIGJlIGluIGJvdW5kc1wiKTtcclxuXHRcdHJldHVybjtcclxuXHR9O1xyXG5cdFxyXG5cdGlmIChzaW11bGF0aW9uRGF0YS5ncm91bmRbMF0qcFswXSArIHNpbXVsYXRpb25EYXRhLmdyb3VuZFsxXSpwWzFdIDwgMCkge1xyXG5cdFx0YWxlcnQoXCJwb2ludCBtdXN0IGJlIGFib3ZlIHRoZSBsaW5lIFwiICsgc2ltdWxhdGlvbkRhdGEuZ3JvdW5kWzBdICsgXCJ4ICsgXCIgKyBzaW11bGF0aW9uRGF0YS5ncm91bmRbMV0gKyBcInkgPSAwXCIpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRzaW11bGF0aW9uRGF0YS52ZWxvY2l0eS5wdXNoKHYpO1xyXG5cdHNpbXVsYXRpb25EYXRhLnBvc2l0aW9uLnB1c2gocCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjbGVhclBhcnRpY2xlc0J1dHRvbkhhbmRsZXIoZXZlbnQpIHtcclxuXHRzaW11bGF0aW9uRGF0YS5wb3NpdGlvbiA9IG5ldyBBcnJheSgpO1xyXG5cdHNpbXVsYXRpb25EYXRhLnZlbG9jaXR5ID0gbmV3IEFycmF5KCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVHcm91bmROb3JtYWxCdXR0b25IYW5kbGVyKGV2ZW50KSB7XHJcblx0dmFyIHggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3hHcm91bmRcIikudmFsdWU7XHJcblx0dmFyIHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3lHcm91bmRcIikudmFsdWU7XHJcblx0XHJcblx0aWYgKHkgPD0wKSB7XHJcblx0XHRhbGVydChcInkgbXVzdCBiZSBwb3NpdGl2ZVwiKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0aWYgKHkgPCBNYXRoLmFicyh4KSkge1xyXG5cdFx0YWxlcnQoXCJUaGUgc2ltdWxhdGlvbiBkb2Vzbid0IHdvcmsgd2VsbCBpZiB0aGUgbWFnbml0dWRlIG9mIHggaXMgZ3JlYXRlciB0aGFuIHlcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRzaW11bGF0aW9uRGF0YS5ncm91bmQ9W3gseV07XHJcblx0Ym91bmRhcnkgPSBib3VuZGFyeVBvaW50cygpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlVGltZVN0ZXBCdXR0b25IYW5kbGVyKGV2ZW50KSB7XHJcblx0dmFyIHRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lU3RlcFwiKS52YWx1ZTtcclxuXHRzaW11bGF0aW9uRGF0YS5kdD10cztcclxufTtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUZvcm0oc2ltdWxhdGlvbkRhdGEpIHtcclxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3hQb3NpdGlvblwiKS52YWx1ZSA9IDAuMDtcclxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3lQb3NpdGlvblwiKS52YWx1ZSA9IDAuNTtcclxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3hWZWxvY2l0eVwiKS52YWx1ZSA9IDAuMjtcclxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3lWZWxvY2l0eVwiKS52YWx1ZSA9IDAuMTtcclxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3hHcm91bmRcIikudmFsdWUgPSAwLjA7XHJcblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN5R3JvdW5kXCIpLnZhbHVlID0gMS4wO1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVN0ZXBcIikudmFsdWUgPSAwLjA3O1xyXG59O1xyXG5cdFxyXG4iLCIvKlxyXG5BdXRob3I6IE1pY2hhZWwgRG9lc2NoZXJcclxuVGhpcyBtb2R1bGUgZGVmaW5lcyBhIGZ1bmN0aW9uIHRoYXQgaW50ZWdyYXRlcyB0aGUgc3RhdGUgb2YgYSBzeXN0ZW0gZm9yd2FyZCBpbiB0aW1lIGJ5IHRpbWUgc3RlcCBkdC5cclxuRnJhbWV3b3JrIHByb3ZpZGVkIGluIENTNTU4IEFzc2lnbm1lbnQgMSBEZXNjcmlwdGlvbiBieSBNaWtvbGEgTHlzZW5rb1xyXG5DcmVhdGVkIDkvMTEvMjAxM1xyXG5Nb2RpZmllZCA5LzEyLzIwMTMgdG8gYWRkIHJlZmxlY3Rpb24gb2ZmIG9mIHRoZSBncm91bmQgbGluZVxyXG5Nb2RpZmllZCA5LzEzLzIwMTMgYnVnIGZpeGVzXHJcbk5vdGU6IHRoaXMgc2ltdWxhdGlvbiBhc3N1bWVzIHRoYXQgdGhlIHBhcnRpY2xlcyBkbyBub3QgaW50ZXJhY3QsIHRoYXQgYWxsIHBhcnRpY2xlcyBiZWdpbiB3aXRoaW4gXHJcbiAgIGJvdW5kcywgYW5kIHRoYXQgdGhlIHkgY29tcG9uZW50IG9mIHRoZSBncm91bmQgbm9ybWFsIGlzIHBvc2l0aXZlLlxyXG5Ob3RlOiBUaGUgc2ltdWxhdGlvbiBhbHNvIGRvZXMgbm90IHlldCBhbGxvdyBmb3IgdGhlIHBhcnRpY2xlcyB0byBib3VuY2Ugb2ZmIG9mIG11bHRpcGxlIHdhbGxzIGluIG9uZSB0aW1lIHN0ZXAuXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwb3NpdGlvbiwgdmVsb2NpdHksIGdyb3VuZCwgZHQpIHtcclxuXHR2YXIgbmV4dFBvc2l0aW9uID0gbmV3IEFycmF5KHBvc2l0aW9uLmxlbmd0aClcclxuXHR2YXIgbmV4dFZlbG9jaXR5ID0gbmV3IEFycmF5KHZlbG9jaXR5Lmxlbmd0aClcclxuXHJcbiAgXHJcbiAgLy8gQ29tcHV0ZSBuZXh0IHN0YXRlIGhlcmVcclxuICBmb3IgKHZhciBpID0gMDsgaTxwb3NpdGlvbi5sZW5ndGg7IGkrKykge1xyXG5cdG5leHRQb3NpdGlvbltpXSA9IG5ldyBBcnJheSgyKTtcclxuXHRuZXh0UG9zaXRpb25baV1bMF0gPSBwb3NpdGlvbltpXVswXSArIGR0ICogdmVsb2NpdHlbaV1bMF07XHJcblx0bmV4dFBvc2l0aW9uW2ldWzFdID0gcG9zaXRpb25baV1bMV0gKyBkdCAqIHZlbG9jaXR5W2ldWzFdO1xyXG5cdG5leHRWZWxvY2l0eVtpXSA9IG5ldyBBcnJheSgyKTtcclxuXHRuZXh0VmVsb2NpdHlbaV1bMF0gPSB2ZWxvY2l0eVtpXVswXTtcclxuXHRuZXh0VmVsb2NpdHlbaV1bMV0gPSB2ZWxvY2l0eVtpXVsxXTtcclxuXHRcclxuXHRpZiAobmV4dFBvc2l0aW9uW2ldWzBdID49IDEpIHtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gb3V0IG9mIGJvdW5kcyByaWdodFxyXG5cdFx0bmV4dFBvc2l0aW9uW2ldWzBdID0gKG5leHRQb3NpdGlvbltpXVswXS0xKSotMSArIDE7XHJcblx0XHRuZXh0VmVsb2NpdHlbaV1bMF0gKj0gLTE7XHJcblx0fVxyXG5cdGlmIChuZXh0UG9zaXRpb25baV1bMF0gPD0gLTEpIHtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gb3V0IG9mIGJvdW5kcyBsZWZ0XHJcblx0XHRuZXh0UG9zaXRpb25baV1bMF0gPSAobmV4dFBvc2l0aW9uW2ldWzBdKzEpKi0xIC0xO1xyXG5cdFx0bmV4dFZlbG9jaXR5W2ldWzBdICo9IC0xO1xyXG5cdH1cclxuXHRpZiAobmV4dFBvc2l0aW9uW2ldWzFdID49IDEpIHtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gb3V0IG9mIGJvdW5kcyB0b3BcclxuXHRcdG5leHRQb3NpdGlvbltpXVsxXSA9IChuZXh0UG9zaXRpb25baV1bMV0tMSkqLTEgKyAxO1xyXG5cdFx0bmV4dFZlbG9jaXR5W2ldWzFdICo9IC0xO1xyXG5cdH1cclxuXHRpZiAoZ3JvdW5kWzBdKm5leHRQb3NpdGlvbltpXVswXSArIGdyb3VuZFsxXSpuZXh0UG9zaXRpb25baV1bMV0gPDApIHtcdC8vIGJlbG93IGdyb3VuZFxyXG5cdFx0Ly8gc29sdmUgZm9yIGludGVyc2VjdGlvbiBwb2ludFxyXG5cdFx0XHJcblx0XHQvL2FiYnJldmlhdGVkIHZhcmlhYmxlcyB0byBtYWtlIHRoZSBjYWxjdWxhdGlvbiBvZiB0IGVhc2llciB0byByZWFkXHJcblx0XHR2YXIgZ3ggPSBncm91bmRbMF07XHJcblx0XHR2YXIgZ3kgPSBncm91bmRbMV07XHJcblx0XHR2YXIgcHggPSBwb3NpdGlvbltpXVswXTtcclxuXHRcdHZhciBweSA9IHBvc2l0aW9uW2ldWzFdO1xyXG5cdFx0dmFyIHZ4ID0gdmVsb2NpdHlbaV1bMF07XHJcblx0XHR2YXIgdnkgPSB2ZWxvY2l0eVtpXVsxXTtcclxuXHRcdFxyXG5cdFx0Ly8gbGluZSAxID09PiBneCAqIHggKyBneSAqIHkgPSAwXHJcblx0XHQvLyBsaW5lIDIgPT0+IHAgPSBwb3NpdGlvbiArIHQqdmVsb2NpdHlcclxuXHRcdC8vIGd4Kihwb3NpdGlvbi5YICsgdCp2ZWxvY2l0eS5YKSArIGd5ICogKHBvc2l0aW9uLlkgKyB0KnZlbG9jaXR5LlkpID0gMFxyXG5cdFx0dmFyIHQgPSAoLTEpKihneCpweCArIGd5KnB5KSAvIChneCp2eCArIGd5KnZ5KTtcclxuXHRcdFx0XHRcclxuXHRcdC8vIHRoZSBwb2ludCBvZiBpbnRlcnNlY3Rpb25cclxuXHRcdHZhciBpbnRlcnNlY3Rpb24gPSBuZXcgQXJyYXkoMik7XHJcblx0XHRpbnRlcnNlY3Rpb25bMF0gPSBwb3NpdGlvbltpXVswXSArIHQqdmVsb2NpdHlbaV1bMF07XHJcblx0XHRpbnRlcnNlY3Rpb25bMV0gPSBwb3NpdGlvbltpXVsxXSArIHQqdmVsb2NpdHlbaV1bMV07XHJcblx0XHRcclxuXHRcdC8vdXBkYXRlIHRoZSB2ZWxvY2l0eSB2ZWN0b3Igd2l0aCB0aGUgcmVmbGVjdGlvbiB2ZWN0b3JcclxuXHRcdHZhciByID0gbmV3IEFycmF5KDIpOyAgIC8vIHJlZmxlY3Rpb25cclxuXHRcdHZhciB2ID0gdmVsb2NpdHlbaV07XHQvLyBpbmNpZGVudCBcclxuXHRcdHZhciBuID0gZ3JvdW5kO1x0XHRcdC8vIG5vcm1hbFxyXG5cdFx0XHJcblx0XHQvLyByZWZsZWN0aW9uIHZlY3RvclxyXG5cdFx0clswXSA9IHZbMF0gLSAyICogKCAodlswXSpuWzBdICsgdlsxXSpuWzFdKSAvIChuWzBdKm5bMF0gKyBuWzFdKm5bMV0pICkqIG5bMF07XHJcblx0XHRyWzFdID0gdlsxXSAtIDIgKiAoICh2WzBdKm5bMF0gKyB2WzFdKm5bMV0pIC8gKG5bMF0qblswXSArIG5bMV0qblsxXSkgKSogblsxXTtcclxuXHRcdG5leHRWZWxvY2l0eVtpXSA9IHI7XHJcblx0XHRcclxuXHRcdC8vIHVwZGF0ZSBwb3NpdGlvblxyXG5cdFx0bmV4dFBvc2l0aW9uW2ldWzBdID0gaW50ZXJzZWN0aW9uWzBdICsgZHQgKiBuZXh0VmVsb2NpdHlbaV1bMF0gKiAoMS10KTtcclxuXHRcdG5leHRQb3NpdGlvbltpXVsxXSA9IGludGVyc2VjdGlvblsxXSArIGR0ICogbmV4dFZlbG9jaXR5W2ldWzFdICogKDEtdCk7XHJcblx0XHR9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcG9zaXRpb246IG5leHRQb3NpdGlvbixcclxuICAgIHZlbG9jaXR5OiBuZXh0VmVsb2NpdHlcclxuICB9XHJcbn0iXX0=
;