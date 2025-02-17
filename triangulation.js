// Input: Polygon points (vertices) in clock-wise order
// Output: list of triangle coordinates

/**
 * Class representing a vertex in a polygon.
 */
class Vertex {
  /**
   * Create a vertex.
   * @param {Array.<number>} point - [x, y] coordinates.
   * @param {Vertex} [next=null] - Pointer to the next vertex.
   * @param {Vertex} [prev=null] - Pointer to the previous vertex.
   */
  constructor(point, next = null, prev = null) {
    this.point = point; // [x, y] coordinates
    this.next = next; // pointer to next vertex
    this.prev = prev; // pointer to previous vertex
    this.isConvex = false; // is this a convex vertex?
    this.isEar = false; // is this vertex an ear?
  }
}

/**
 * Class representing a circular doubly linked list.
 */
class CircularList {
  /**
   * Create a circular list.
   * @param {Vertex} head - Head vertex of the list.
   * @param {number} size - Size of the list.
   */
  constructor() {
    this.head = null;
    this.size = 0;
  }

  /**
   * Insert a new node after the previous node in the list.
   * @param {Vertex} newNode - New vertex to be inserted.
   * @param {Vertex} previous - Previous vertex after which the new node will be inserted.
   */
  insert(newNode, previous) {
    if (this.head == null) {
      this.head = newNode;
      newNode.next = newNode;
      newNode.prev = newNode;
      this.size++;
      return;
    }

    let next = previous.next;

    previous.next = newNode;
    newNode.prev = previous;

    newNode.next = next;
    next.prev = newNode;

    this.size++;
  }

  /**
   * Delete a node from the list.
   * @param {Vertex} node - Vertex to be deleted.
   * @throws {Error} - If the node is null.
   */
  delete(node) {
    if (node == null) {
      throw new Error("Input is Null!");
    }

    // If it's the last Node
    if (this.size == 1 && node == this.head) {
      this.size = 0;
      this.head = null;
      return;
    }

    if (node === this.head) {
      // Update the head
      this.head = this.head.next;
    }

    let prev = node.prev;
    let next = node.next;
    prev.next = next;
    next.prev = prev;

    this.size--;
  }
}

/**
 * Create a doubly linked list of vertices from the initial array of points.
 * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates.
 * @returns {CircularList} - Circular doubly linked list of vertices.
 * @throws {Error} - If less than 3 vertices are provided.
 */
function createDoublyLinkedList(points) {
  // Check if the number of points is less than 3
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.length} provided`);
  }

  // Initialize a new CircularList to store the vertices
  const vertices = new CircularList();

  // Iterate through each point in the input array
  for (let i = 0; i < points.length; i++) {
    // Create a new Vertex for each point
    const newVertex = new Vertex(points[i]);
    // Insert the new vertex into the circular list
    vertices.insert(newVertex);
  }

  // Return the populated circular doubly linked list
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
 * @param {CircularList} otherPoints - Other vertices in the polygon.
 * @returns {boolean} - True if the vertex is an ear, false otherwise.
 */
function isEar(a, b, c, otherPoints) {
  // make sure angle at b is convex
  if (!isConvex(a, b, c)) {
    return false;
  }

  // Make sure no other points lie inside triangle O(N)
  let curr = otherPoints.head;
  for (let i = 0; i < otherPoints.size; i++) {
    const point = curr.point;
    if (point === a || point === b || point === c) {
      curr = curr.next;
      continue;
      // Don't check against the same point
    }

    // if any points is in triangle return false
    if (isWithinTriangle(point, a, b, c)) {
      return false;
    }
    curr = curr.next;
  }

  return true;
}

/**
 * Check if a point is within a triangle.
 * @param {Array.<number>} point - [x, y] coordinates.
 * @param {Array.<number>} a - First vertex of the triangle.
 * @param {Array.<number>} b - Second vertex of the triangle.
 * @param {Array.<number>} c - Third vertex of the triangle.
 * @returns {boolean} - True if the point is within the triangle, false otherwise.
 * @throws {Error} - If the points provided are collinear.
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
 * This algorithm works by iteratively removing "ears" from the polygon until only one triangle remains.
 * An ear is a triangle formed by three consecutive vertices (a, b, c) such that no other vertex lies inside the triangle.
 *
 * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates representing the polygon vertices in clockwise order.
 * @returns {Array.<Array.<Array.<number>>>} - List of triangles, where each triangle is represented by an array of three [x, y] coordinates.
 * @throws {Error} - If less than 3 vertices are provided.
 */
function naiveEarCutting(points) {
  // Check for no colinear vertices
  // Check if polygon is simple

  // Check if input size is appropriate
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.len} provided`);
  }

  // Copy Points into a doubly linked circular List
  const vertices = createDoublyLinkedList(points);

  const triangles = [];

  // while remainingVertices > 3
  while (vertices.size > 3) {
    let vertex = vertices.head;

    let curr = vertex.point;
    let prev = vertex.prev.point;
    let next = vertex.next.point;

    if (isEar(prev, curr, next)) {
      // Add new Triangle
      triangles.push([prev.slice(), curr.slice(), next.slice()]);

      // Remove the ear tip (keep only the new diagonal)
      vertices.delete(vertex);
    }
  }

  // Add 3 remaining points
  let a = vertices.head.point;
  let b = vertices.head.next.point;
  let c = vertices.head.next.next.point;
  triangles.push([a.slice(), b.slice(), c.slice()]);

  return triangles;
}

/**
 * Optimized ear cutting algorithm for polygon triangulation.
 * This algorithm improves upon the naive ear cutting method by maintaining separate lists of convex and concave vertices,
 * and only checking convex vertices for ears.
 *
 * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates representing the polygon vertices in clockwise order.
 * @returns {Array.<Array.<Array.<number>>>} - List of triangles, where each triangle is represented by an array of three [x, y] coordinates.
 * @throws {Error} - If less than 3 vertices are provided.
 */
function optimizedEarCutting(points) {
  // Check if input size is appropriate
  if (points.length < 3) {
    throw new Error(`Needs at Least 3 Vertices, ${points.length} provided`);
  }

  // Create a circular doubly linked list from the points array
  const vertices = createDoublyLinkedList(points);

  const concaveVertices = new CircularList();
  const convexVertices = new CircularList();

  const triangles = [];

  // Fill the concave and convex lists
  let curr = vertices.head;
  for (let i = 0; i < vertices.size; i++) {
    if (isConvex(curr.prev.point, curr.point, curr.next.point)) {
      curr.isConvex = true;
      convexVertices.insert(curr);
    } else {
      curr.isConvex = false;
      concaveVertices.insert(curr);
    }
    curr = curr.next;
  }

  // Mark initial ears
  curr = convexVertices.head;
  for (let i = 0; i < convexVertices.size; i++) {
    curr.isEar = isEar(
      curr.prev.point,
      curr.point,
      curr.next.point,
      concaveVertices
    );
    curr = curr.next;
  }

  // We need only check convex points for ears
  while (vertices.size > 3) {
    curr = convexVertices.head;
    for (let i = 0; i < convexVertices.size; i++) {
      if (curr.isEar) {
        // Add new Triangle
        triangles.push([
          curr.prev.point.slice(),
          curr.point.slice(),
          curr.next.point.slice(),
        ]);

        // Remove the ear tip
        vertices.delete(curr);
        convexVertices.delete(curr);

        // Update the convex/concave status of the neighbors
        let prev = curr.prev;
        let next = curr.next;

        if (isConvex(prev.prev.point, prev.point, prev.next.point)) {
          prev.isConvex = true;
          if (!convexVertices.head || prev.prev === convexVertices.head.prev) {
            convexVertices.insert(prev);
          }
        } else {
          prev.isConvex = false;
          concaveVertices.insert(prev);
        }

        if (isConvex(next.prev.point, next.point, next.next.point)) {
          next.isConvex = true;
          if (!convexVertices.head || next.prev === convexVertices.head.prev) {
            convexVertices.insert(next);
          }
        } else {
          next.isConvex = false;
          concaveVertices.insert(next);
        }

        // Update ear status of the neighbors
        prev.isEar = isEar(
          prev.prev.point,
          prev.point,
          prev.next.point,
          vertices
        );
        next.isEar = isEar(
          next.prev.point,
          next.point,
          next.next.point,
          vertices
        );

        break;
      }
      curr = curr.next;
    }
  }

  // Add the last remaining triangle
  let a = vertices.head.point;
  let b = vertices.head.next.point;
  let c = vertices.head.next.next.point;
  triangles.push([a.slice(), b.slice(), c.slice()]);

  return triangles;
}

/**
 * Check if two line segments intersect.
 * @param {Array.<number>} p1 - First point of the first segment.
 * @param {Array.<number>} q1 - Second point of the first segment.
 * @param {Array.<number>} p2 - First point of the second segment.
 * @param {Array.<number>} q2 - Second point of the second segment.
 * @returns {boolean} - True if the segments intersect, false otherwise.
 */
function doIntersect(p1, q1, p2, q2) {
  const o1 = getOrientation(p1, q1, p2);
  const o2 = getOrientation(p1, q1, q2);
  const o3 = getOrientation(p2, q2, p1);
  const o4 = getOrientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  return false;
}

/**
 * Check if a polygon is simple (no self-intersections).
 * @param {Array.<Array.<number>>} polygon - Array of [x, y] coordinates representing the polygon vertices.
 * @returns {boolean} - True if the polygon is simple, false otherwise.
 */
function isSimplePolygon(polygon) {
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (
        doIntersect(
          polygon[i],
          polygon[(i + 1) % n],
          polygon[j],
          polygon[(j + 1) % n]
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Generate a random simple polygon with a specified number of vertices.
 * @param {number} numVertices - Number of vertices.
 * @returns {Array.<Array.<number>>} - Array of [x, y] coordinates representing the polygon vertices.
 */
function generateRandomSimplePolygon(numVertices) {
  let polygon;
  do {
    polygon = generateRandomPolygon(numVertices);
  } while (!isSimplePolygon(polygon));
  return polygon;
}

/**
 * Generate a random polygon with a specified number of vertices.
 * @param {number} numVertices - Number of vertices.
 * @returns {Array.<Array.<number>>} - Array of [x, y] coordinates representing the polygon vertices.
 */
function generateRandomPolygon(numVertices) {
  const points = [];
  for (let i = 0; i < numVertices; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    points.push([x, y]);
  }
  return points;
}

/**
 * Main method to test and time triangulation on randomly generated simple polygons.
 */
function main() {
  const sizes = [100, 500, 1000, 5000, 10000];
  for (let size of sizes) {
    const polygon = generateRandomSimplePolygon(size);
    console.log(`Polygon with ${size} vertices generated.`);

    console.time(`Naive Ear Cutting (${size} vertices)`);
    triangulate(polygon, naiveEarCutting);
    console.timeEnd(`Naive Ear Cutting (${size} vertices)`);

    console.time(`Optimized Ear Cutting (${size} vertices)`);
    triangulate(polygon, optimizedEarCutting);
    console.timeEnd(`Optimized Ear Cutting (${size} vertices)`);
  }
}

// Run the main method
main();
