"use strict";

// Global Variables
let pointColor = "white";
let selectionColor = "green";
let lineColor = "blue";
let frameTime = 50; // milliseconds
let numPoints = 50;
let pointSize = 4;

/** @type HTMLCanvasElement */
const myCanvas = document.getElementById("myCanvas");

// Setup Canvas
const width = window.innerWidth;
myCanvas.width = width;
const height = window.innerHeight;
myCanvas.height = height;

/** @type {CanvasRenderingContext2D} */
const ctx = myCanvas.getContext("2d");

// Initialize Data Structures
const points = get2dPoints(numPoints);
const pointColors = new Map(
  points.map((point) => [hashPoint(point), pointColor])
);

const lines = new Map();

/**
 * @param {number} n - Number of points to generate
 * @returns {Array.<Array.<number>>} - Array of points [x, y]
 */
function get2dPoints(n) {
  let result = [];

  const x0 = myCanvas.width / 4;
  const xSpan = x0 * 2;
  const y0 = myCanvas.height / 4;
  const ySpan = y0 * 2;

  for (let i = 0; i < n; i++) {
    let x = x0 + Math.floor(Math.random() * xSpan);
    let y = y0 + Math.floor(Math.random() * ySpan);

    result.push([x, y]);
  }

  return result;
}

/**
 * @param {Array.<number>} point - Point [x, y]
 * @returns {number} - Hash value of the point
 */
function hashPoint(point) {
  // Simple hash function combining the two integer values
  return point[0] * 31 + point[1];
}

/**
 * @param {Array.<number>} p1 - Point 1 [x, y]
 * @param {Array.<number>} p2 - Point 2 [x, y]
 * @returns {number} - Hash value of the points
 */
function hashPoints(p1, p2) {
  // Simple hash function combining the four integer values
  const hash = (p1[0] * 31 + p1[1]) * 31 + p2[0] * 31 + p2[1];
  return hash;
}

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 * @param {Map} lines - Map of lines
 */
function draw(points, lines) {
  clear();
  drawPoints(points);
  drawLines(lines);
}

/**
 * Clears the canvas
 */
function clear() {
  // clears the canvas
  ctx.clearRect(0, 0, width, height);
}

/**
 * @param {Map} lines - Map of lines
 * @param {Array.<number>} p1 - Point 1 [x, y]
 * @param {Array.<number>} p2 - Point 2 [x, y]
 */
function addLine(lines, p1, p2) {
  lines.set(hashPoints(p1, p2), [p1, p2]);
}

/**
 * @param {Map} lines - Map of lines
 * @param {Array.<number>} p1 - Point 1 [x, y]
 * @param {Array.<number>} p2 - Point 2 [x, y]
 */
function removeLine(lines, p1, p2) {
  lines.delete(hashPoints(p1, p2));
}

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 */
function drawPoints(points) {
  for (let i = 0; i < points.length; i++) {
    // Draw Point with color from pointColors map
    drawPoint(points[i], pointColors.get(hashPoint(points[i])));
  }
}

/**
 * @param {Array.<number>} point - Point [x, y]
 * @param {string} [color=pointColor] - Color of the point
 * @param {number} [radius=pointSize] - Radius of the point
 */
function drawPoint(point, color = pointColor, radius = pointSize) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point[0], point[1], radius, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * @param {Array.<number>} point - Point [x, y]
 * @param {string} [color="black"] - Color to clear the point
 * @param {number} [radius=5] - Radius to clear the point
 */
function clearPoint(point, color = "black", radius = 5) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point[0], point[1], radius, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * @param {Map} lines - Map of lines
 */
function drawLines(lines) {
  for (let line of lines.values()) {
    drawLine(line);
  }
}

/**
 * @param {Array.<number>} line - Line [[x1, y1], [x2, y2]]
 * @param {string} [color="blue"] - Color of the line
 * @param {number} [width=4] - Width of the line
 */
function drawLine(line, color = "blue", width = 4) {
  ctx.beginPath();
  ctx.moveTo(line[0][0], line[0][1]);
  ctx.lineTo(line[1][0], line[1][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

/**
 * Resets the colors of all points to the default point color
 */
function resetPointColors() {
  for (let key of pointColors.keys()) {
    pointColors.set(key, pointColor);
  }
}

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 * @param {Function} [algorithm=jarvisMarch] - Convex hull algorithm to use
 */
function convexHull(points, algorithm = jarvisMarch) {
  if (!Array.isArray(points)) {
    throw new Error("Expected an array of points as input!");
  }

  algorithm(points);
}

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 */
function jarvisMarch(points) {}

/**
 * @param {Array.<number>} p1 - Point 1 [x, y]
 * @param {Array.<number>} p2 - Point 2 [x, y]
 * @returns {number} - Angle between the points
 */
//p1 is starting, p2 is what you're checking
function getAngle(p1, p2) {
  // return c.c.w. angle from horizontal to p1-p2 segment

  const dx = p2[0] - p1[0];
  const dy = -(p2[1] - p1[1]);
  // Flipping dy since y axis if flipped on display

  if (dx == 0) {
    if (dy > 0) {
      return Math.PI / 2;
    }
    return (3 * Math.PI) / 2;
  }

  if (dx > 0) {
    if (dy > 0) {
      // Q1
      return Math.atan(dy / dx);
    }
    // Q4
    if (dy < 0) return Math.atan(dy / dx) + Math.PI * 2;
    // dy = 0
    return 0;
  }

  if (dx < 0) {
    // Q2 or Q3
    return Math.atan(dy / dx) + Math.PI;
  }
}

/**
 * @param {Array.<number>} refPoint - Reference point [x, y]
 * @returns {Function} - Comparator function for sorting points by angle
 */
function compareAngle(refPoint) {
  // Return comparator function
  return (a, b) => {
    // Return difference of angles with reference Point
    return getAngle(refPoint, a) - getAngle(refPoint, b);
  };
}

/**
 * @param {Array.<number>} v1 - Vector 1 [x, y]
 * @param {Array.<number>} v2 - Vector 2 [x, y]
 * @returns {number} - Cross product of the vectors
 */
function cross(v1, v2) {
  // Return cross product of vectors v1, v2 respectively

  return v1[0] * v2[1] - v1[1] * v2[0];
}

/**
 * @param {Array.<number>} p1 - Point 1 [x, y]
 * @param {Array.<number>} p2 - Point 2 [x, y]
 * @param {Array.<number>} p3 - Point 3 [x, y]
 * @returns {number} - Orientation of the points (CCW (1), CW (-1), Collinear (0))
 */
function getOrientation(p1, p2, p3) {
  // Orientation of 3 Points Can be
  // CCW (1), CW (-1), Collinear (0)

  const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
  const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

  const res = cross(v1, v2);

  if (res > 0) {
    return 1; // CCW
  } else if (res < 0) {
    return -1; // CW
  } else {
    return 0;
  }
}

/**
 * Return p1 - p2.
 * @param {Array.<number>} p1 - Point 1 [x, y]
 * @param {Array.<number>} p2 - Point 2 [x, y]
 * @returns {Array.<number>} - Result of subtracting p2 from p1
 */
function subtractPoints(p1, p2) {
  // Return p1 - p2
  return [p1[0] - p2[0], p1[1] - p2[1]];
}

// TODO:
// Add function to return intersection between two line segs
// function getIntersection(p1, p2, p3, p4) {
//   // Get intersection of two lines defined by points p1, p2 and p3, p4

//   // product of orientations less than zero means they are flipped and not colinear
//   // meaning the points are on opposite sides of the segment p1 - p2 (S1)
//   // Check that for the other segment (S2), and if both conditions hold there is an intersection
//   if (
//     getOrientation(p1, p3, p2) * getOrientation(p1, p4, p2) < 0 &&
//     getOrientation(p3, p1, p4) * getOrientation(p3, p2, p4) < 0
//   ) 
//   {
//     // Calculate the Coordinates of the intersection
//     const slope1 = (p2[0] - p1[0]) / (p2[1] - p1[1]);
//     const slope2 = (p4[0] - p3[0]) / (p4[1] - p3[1]);

//     // x = (p1.x - p3.x) / (slope2 - slope1)
//     const x = (p1[0] - p3[0]) / (slope2 - slope1);

//     // y = p1.y + slope1 * x
//     const y = p1[1] + slope1 * x;

//     return [x, y];
//   }
// }

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 */
async function grahamScan(points) {
  // create copy of the points
  // Get the full slice of the original array
  const pointsCopy = points.slice();

  // Get bottom point (max Y coordinate)
  // O(N)
  let bottomIdx = 0;
  for (let i = 0; i < pointsCopy.length; i++) {
    if (pointsCopy[i][1] > pointsCopy[bottomIdx][1]) {
      bottomIdx = i;
    }
  }

  const bottomPoint = pointsCopy[bottomIdx];

  // Mark that proint with the selection color
  pointColors.set(hashPoint(bottomPoint), selectionColor);

  // Redraw
  draw(pointsCopy, lines);

  // Remove point from original array O(N)
  pointsCopy.splice(bottomIdx, 1);

  // Sort points based on angle O(N * Log(N))
  pointsCopy.sort(compareAngle(bottomPoint));

  // paint & Connect each point
  for (let i = 0; i < pointsCopy.length; i++) {
    setTimeout(() => {
      console.log(i, ": Angle = ", getAngle(bottomPoint, pointsCopy[i]));
      drawPoint(pointsCopy[i], pointColors.get(hashPoint(pointsCopy[i])));
    }, (2 + i) * 2000);
  }

  stack;

  // Reset the Colors
  resetPointColors();
}

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 */
function chenAlgorithm(points) {}

/**
 * @param {Array.<Array.<number>>} points - Array of points [x, y]
 * @param {Map} lines - Map of lines
 */
async function drawAndErase(points, lines) {
  // draw Lines
  for (let i = 0; i < points.length - 1; i++) {
    addLine(lines, points[i], points[i + 1]);

    await new Promise((resolve) => setTimeout(resolve, frameTime));
    draw(points, lines);
  }

  // Erase Lines
  for (let i = 0; i < points.length - 1; i++) {
    removeLine(lines, points[i], points[i + 1]);

    await new Promise((resolve) => setTimeout(resolve, frameTime));
    draw(points, lines);
  }
}

/**
 * Main function to run the visualization
 */
async function run() {
  // Testing Drawing

  drawPoints(points);
  grahamScan(points);
}

run();
