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