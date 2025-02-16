// Input: Polygon points (vertices) in clock-wise order
// Output: list of triangle coordinates

// Structure to allow for linked list
class Vertex {
  constructor(point, next = null, prev = null) {
    this.point = point; // [x, y] coordinates
    this.next = next; // pointer to next vertex
    this.prev = prev; // pointer to previous vertex
    this.isConvex = false; // is this a convex vertex?
    this.isEar = false; // is this vertex an ear?
  }
}

/**
 * Create a doubly linked list of vertices from the initial array of points.
 * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates.
 * @returns {Array.<Vertex>} - Circular doubly linked list of vertices.
 */
function createDoublyLinkedList(points) {
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.length} provided`);
  }

  // Create a new vertex obj for every point in the list and add it to "Vertices"
  const vertices = points.map((point) => new Vertex(point));

  // Set up circular doubly-linked list
  for (let i = 0; i < vertices.length; i++) {
    vertices[i].next = vertices[(i + 1) % vertices.length];
    vertices[i].prev = vertices[(i - 1 + vertices.length) % vertices.length];
  }

  return vertices;
}

/**
 * Triangulate a polygon using the specified triangulation method.
 * @param {Array.<Array.<number>>} polygon - Array of [x, y] coordinates.
 * @param {Function} triangulationMethod - Function to use for triangulation.
 * @returns {Array.<Array.<Array.<number>>>} - List of triangles.
 */
function triangulate(polygon, triangulationMethod = naiveEarCutting) {
  return triangulationMethod(polygon);
}

/**
 * Check if a vertex is an ear.
 * @param {Array.<number>} a - Previous vertex.
 * @param {Array.<number>} b - Current vertex.
 * @param {Array.<number>} c - Next vertex.
 * @param {Array.<Array.<number>>} otherPoints - Other vertices in the polygon.
 * @returns {boolean} - True if the vertex is an ear, false otherwise.
 */
function isEar(a, b, c, otherPoints) {
  // make sure angle at b is convex
  if (!isConvex(a, b, c)) {
    return false;
  }

  // Make sure no other points lie inside triangle O(N)
  for (let i = 0; i < otherPoints.length; i++) {
    const point = array[i];
    // if any points is in triangle return false
    if (isWithinTriangle(point, a, b, c)) {
      return false;
    }
  }
}

/**
 * Check if a point is within a triangle.
 * @param {Array.<number>} point - [x, y] coordinates.
 * @param {Array.<number>} a - First vertex of the triangle.
 * @param {Array.<number>} b - Second vertex of the triangle.
 * @param {Array.<number>} c - Third vertex of the triangle.
 * @returns {boolean} - True if the point is within the triangle, false otherwise.
 */
function isWithinTriangle(point, a, b, c) {
  /*
    // For a point to be within the triangle a,b,c
    // the point must be to the same side of all oriented segments
    // ab , bc, ca
    // if orientation of a,b,c was C.C.W then point should be strictly to the left of eeach segment
    // and if orientation was C.W. the it should be strictly to the right
    // We can simply check if all 3 orientations are the same
    // The only way that can happen is if point is inside trinagle
    // A point couldn't be outside the traingle and satisfy that the 3 orientations are the same
    */

  // Ensure Triangle is not colinear
  if (getOrientation(a, b, c) === 0) {
    throw new Error("Points provided are collinear and do not form a triangle");
  }

  // Ensure point is not any of the triangle vertices
  if (point == a || point == b || point == c) {
    return true;
  }

  // Get Orientation of point with each side
  const o1 = getOrientation(point, a, b);
  const o2 = getOrientation(point, b, c);
  const o3 = getOrientation(point, c, a);

  // All CW or All CCW - is within
  if (o1 == o2 && o2 == o3) {
    return true;
  }

  // one 0 and others Matching - is wihtin (on the edge)
  // Can make this neater by getting the sum (sum == 0 false, sum == +2 or -2 then it's on an edge)
  if (o1 * o2 * o3 == 0) {
    return o1 == o2 || o1 == o3 || o2 == o3;
    /*
    We can do this because for sure there will not be 2 zeroes
    The only way that would happen is if the point was on the vertice
    Which we already checked for
    So if the remaining two are the same it is within
    */
  }
  // else - Outside
  return false;
}

/**
 * Calculate the cross product of two vectors.
 * @param {Array.<number>} v1 - First vector.
 * @param {Array.<number>} v2 - Second vector.
 * @returns {number} - Cross product of the vectors.
 */
function cross(v1, v2) {
  // Return cross product of vectors v1, v2 respectively

  return v1[0] * v2[1] - v1[1] * v2[0];
}

/**
 * Get the orientation of three points.
 * @param {Array.<number>} p1 - First point.
 * @param {Array.<number>} p2 - Second point.
 * @param {Array.<number>} p3 - Third point.
 * @returns {number} - 1 if counter-clockwise, -1 if clockwise, 0 if collinear.
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
 * Check if three points form a convex angle.
 * @param {Array.<number>} a - First point.
 * @param {Array.<number>} b - Second point.
 * @param {Array.<number>} c - Third point.
 * @returns {boolean} - True if the angle is convex, false otherwise.
 */
function isConvex(a, b, c) {
  return getOrientation(a, b, c) === 1;
}

/**
 * Naive ear cutting algorithm for polygon triangulation.
 * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates.
 * @returns {Array.<Array.<Array.<number>>>} - List of triangles.
 */
function naiveEarCutting(points) {
  // Check for no colinear vertices
  // Check if polygon is simple

  // Check if input size is appropriate
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.len} provided`);
  }

  // Create a circular doubly linked list from the points array
  const vertices = createDoublyLinkedList(points);

  const triangles = [];

  let i = 1;
  // while remainingVertices > 3
  while (vertices.length > 3) {
    let len = remainingPoints.length;

    let prev = remainingPoints.at(i - (1 % len));
    let curr = remainingPoints.at(i % len);
    let next = remainingPoints.at(i + (1 % len));

    if (isEar(prev, curr, next)) {
      // Add new Triangle
      triangles.push(prev, curr, next);

      // Remove the ear tip (keep only the new diagonal)
      remainingPoints.splice(i % len);
    } else {
      // check Next Vertex
      i++;
    }
  }

  // Add 3 remaining points
  triangles.push(...remainingPoints);

  return triangles;
}

/**
 * Optimized ear cutting algorithm for polygon triangulation.
 * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates.
 * @returns {Array.<Array.<Array.<number>>>} - List of triangles.
 */
function optimizedEarCutting(points) {
  /*Input Checking */
  // Check for no colinear vertices
  // Check if polygon is simple
  // Check if input size is appropriate
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.len} provided`);
  }
  /*-----------------*/

  // Create a circular doubly-Linked List from the points
  const vertices = createDoublyLinkedList(points);

  const triangles = [];
  const convexPoints = [];
  const concavePoints = [];

  // Fill the Concave and convex List
  for (const vertex of vertices) {
    if (isConvex(vertex.prev.point, vertex.point, vertex.next.point)) {
      vertex.isConvex = true;
      convexList.push(vertex);
    } else {
      vertex.isConvex = false;
      concaveList.push(vertex);
    }
  }

  for (const vertex of convexPoints) {
    vertex.isEar = true;
    isEar();
  }

  // We need only check convex points for ears
  while (con.length > 3) {
    let len = remainingPoints.length;

    let prev = remainingPoints.at(i - (1 % len));
    let curr = remainingPoints.at(i % len);
    let next = remainingPoints.at(i + (1 % len));

    if (isEar(prev, curr, next)) {
      // Add new Triangle
      triangles.push(prev, curr, next);

      // Remove the ear tip (keep only the new diagonal)
      remainingPoints.splice(i % len);
    } else {
      // check Next Vertex
      i++;
    }
  }
}
