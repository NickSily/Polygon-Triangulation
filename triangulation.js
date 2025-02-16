// Input: Polygon points (vertices) in clock-wise order
// Ouptut: list of triangle coordinates

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

// Create a doubly linked list of vertices from the initial array of points
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

function triangulate(polygon, triangulationMethod = naiveEarCutting) {
  return triangulationMethod(polygon);
}

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
 * @param {Array.<number>} point - [x, y]
 * @param {Array.Array<number>} triangle - Point 2 [x, y]
 * @returns {boolean} - Is Point within triangle
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

function cross(v1, v2) {
  // Return cross product of vectors v1, v2 respectively

  return v1[0] * v2[1] - v1[1] * v2[0];
}

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

function isConvex(a, b, c) {
  return getOrientation(a, b, c) === 1;
}

// Naive Ear Cutting O(N^3)

/*
Time Complexity explanation
    // Loop every vertex to find an ear O(N)
        // Check it it's an ear in O(N)
    O(N^2)

    Go trough each vertex O(N) until finding an ear, and check if it's an ear in O(N)
    thus O(N^2)

    it's O(N2) for every ear we remove, we will remove n-3 ears, whith the input size reducing at every step
    
    So it will be a sum of:

    N^2 + (n-1)^2 + (n-2)^2 + ... + 4^2 --> O(N^3) 
    // Given sum of arithmetic series property
*/
function naiveEarCutting(points) {
  // Check for no colinear vertices
  // Check if polygon is simple

  // Check if input size is appropriate
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.len} provided`);
  }

  // Make a copy of the points array
  // Keep track of remaining points to be triangulated
  const remainingPoints = structuredClone(points);
  // Create a circular doubly-Linked List from the points
  const triangles = [];

  let i = 1;
  // while remainingVertices > 3
  while (remainingPoints.length > 3) {
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
