/*
Author: Michael Doescher
This module defines a tests the implementation of the non-interacting particle simulator for assignment 1.
Framework provided in CS558 Assignment 1 Description by Mikola Lysenko
Created 9/11/2013
Modified 9/13/2013 correcting assert statements that had trouble with floating point calculation, and added additional test cases
 */


var assert = require("assert")
var stepSimulator = require("./mysimulator.js")

var position = [[0.0, 0.5], [0.0, 0.5], [0.0,0.5], [0.0, 0.5], [-0.5, 0.5]];
var velocity = [[0.0, 1.0], [0.0, -1.0], [-2.0, 0.0], [2.0, 0.0], [1.0, -1.0]];
var ground   = [0.0, 1.0]
var dt       = 0.1

for(var i=0; i<10; i++) {
  var t = 0 + i*dt;	
  var nstate = stepSimulator(position, velocity, ground, dt)
  position = nstate.position
  velocity = nstate.velocity
  
  // first particle goes straight up
  assert.ok(Math.abs(position[0][0]) < 1e-6)
  assert.ok(Math.abs(position[0][1] - 1.0 + Math.abs(t - 0.4)) < 1e-6)
  
  // second particle goes straight down
  assert.ok(Math.abs(position[1][0]) < 1e-6);
  assert.ok(Math.abs(position[1][1] - Math.abs(0.4 - t)) < 1e-6)
  
  // third particle goes left
  var p2x = [-0.2, -0.4, -0.6, -0.8, -1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4];
  assert.ok(Math.abs(position[2][0] - p2x[i]) < 1e-6);
  assert.ok(Math.abs(position[2][1] -0.5) < 1e-6);
  
  // fourth particle goes right
  var p3x = [0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4];
  assert.ok(Math.abs(position[3][0] - p3x[i]) < 1e-6);
  assert.ok(Math.abs(position[3][1] -0.5) < 1e-6);
  
  // fifth particle bounces off ground - goes right
  var p4x = [-.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
  var p4y = [.4, .3, .2, .1, 0, .1, .2, .3, .4, .5, .6];
  assert.ok(Math.abs(position[4][0] - p4x[i]) < 1e-6);
  assert.ok(Math.abs(position[4][1] - p4y[i]) < 1e-6);
}

// rotate the ground plane 45 degrees
position = [[0.0, 0.5], [-0.1, 0.5]];
velocity = [[0.0, -1.0], [0.0, -1.0]];
ground   = [1.0, 1.0]
dt       = 0.1

for(var i=0; i<10; i++) {
  var t = 0 + i*dt;	
  var nstate = stepSimulator(position, velocity, ground, dt)
  position = nstate.position
  velocity = nstate.velocity
  
  var pb0x = [0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
  var pb0y = [.4, .3, .2, .1, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.ok(Math.abs(position[0][0] - pb0x[i]) < 1e-6);
  assert.ok(Math.abs(position[0][1] - pb0y[i]) < 1e-6);
  
  var pb0x = [-0.1, -0.1, -0.1, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
  var pb0y = [.4, .3, .2, .1, .1, .1, .1, .1, .1, .1, .1, .1, .1, .1];
  assert.ok(Math.abs(position[1][0] - pb0x[i]) < 1e-6);
  assert.ok(Math.abs(position[1][1] - pb0y[i]) < 1e-6);
}