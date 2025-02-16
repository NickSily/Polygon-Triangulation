class Vertex {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // Reference to one of the half-edges originating from this vertex
    this.incidentEdge = null;
  }
}

class HalfEdge {
  constructor() {
    // The vertex this half-edge originates from
    this.origin = null;
    // The twin/opposite half-edge
    this.twin = null;
    // The face this half-edge borders
    this.face = null;
    // The next half-edge in the face boundary
    this.next = null;
    // The previous half-edge in the face boundary
    this.prev = null;
  }
}

class Face {
  constructor() {
    // Reference to some half-edge bounding this face
    this.outerComponent = null;
    // Array of half-edges forming inner boundaries (holes)
    this.innerComponents = [];
  }
}

// Dooubly-Connected Edge List
class DCEL {
  constructor() {
    this.vertices = [];
    this.halfEdges = [];
    this.faces = [];
  }

  /**
   * Creates a polygon from an array of points.
   * @param {Array.<Array.<number>>} points - Array of [x, y] coordinates.
   */
  createPolygon(points) {
    // Create vertices
    this.vertices = points.map(([x, y]) => new Vertex(x, y));

    // Create half-edges
    const n = points.length;
    for (let i = 0; i < n; i++) {
      // Create twin half-edges
      const he1 = new HalfEdge();
      const he2 = new HalfEdge();

      // Set twins
      he1.twin = he2;
      he2.twin = he1;

      // Set origins
      he1.origin = this.vertices[i];
      he2.origin = this.vertices[(i + 1) % n];

      // Set vertex incident edges
      this.vertices[i].incidentEdge = he1;

      this.halfEdges.push(he1, he2);
    }

    // Connect half-edges in sequence
    for (let i = 0; i < n; i++) {
      // For outer boundary
      this.halfEdges[2 * i].next = this.halfEdges[2 * ((i + 1) % n)];
      this.halfEdges[2 * i].prev = this.halfEdges[2 * ((i - 1 + n) % n)];

      // For inner boundary (twin edges)
      this.halfEdges[2 * i + 1].next =
        this.halfEdges[2 * ((i - 1 + n) % n) + 1];
      this.halfEdges[2 * i + 1].prev = this.halfEdges[2 * ((i + 1) % n) + 1];
    }

    // Create faces
    const outerFace = new Face();
    const innerFace = new Face();

    // Set face references
    outerFace.outerComponent = this.halfEdges[1]; // One of the twin edges
    innerFace.outerComponent = this.halfEdges[0]; // Original edge

    // Set face for each half-edge
    for (let i = 0; i < n; i++) {
      this.halfEdges[2 * i].face = innerFace;
      this.halfEdges[2 * i + 1].face = outerFace;
    }

    this.faces.push(outerFace, innerFace);
  }

  /**
   * Returns the vertices around a given face.
   * @param {Face} face - The face to get vertices around.
   * @returns {Array.<Vertex>} - Array of vertices around the face.
   */
  getVerticesAroundFace(face) {
    const vertices = [];
    const startEdge = face.outerComponent;
    let currentEdge = startEdge;

    do {
      vertices.push(currentEdge.origin);
      currentEdge = currentEdge.next;
    } while (currentEdge !== startEdge);

    return vertices;
  }

  /**
   * Adds a diagonal between two vertices.
   * @param {Vertex} vertex1 - The first vertex.
   * @param {Vertex} vertex2 - The second vertex.
   * @returns {Array.<HalfEdge>} - Array containing the two new half-edges.
   */
  addDiagonal(vertex1, vertex2) {
    // Create new half-edges for the diagonal
    const diagonal1 = new HalfEdge();
    const diagonal2 = new HalfEdge();

    // Set up the twin relationship
    diagonal1.twin = diagonal2;
    diagonal2.twin = diagonal1;

    // Set origins
    diagonal1.origin = vertex1;
    diagonal2.origin = vertex2;

    // Add to half-edges array
    this.halfEdges.push(diagonal1, diagonal2);

    return [diagonal1, diagonal2];
  }

  /**
   * Checks if a diagonal between two vertices is valid.
   * @param {Vertex} vertex1 - The first vertex.
   * @param {Vertex} vertex2 - The second vertex.
   * @returns {boolean} - True if the diagonal is valid, false otherwise.
   */
  isDiagonalValid(vertex1, vertex2) {
    // Implementation would check if:
    // 1. Vertices are not adjacent
    // 2. Diagonal lies inside the polygon
    // 3. Diagonal doesn't intersect any existing edges
    // This is a placeholder for the actual implementation
    return true;
  }
}

// Example usage:
const createSamplePolygon = () => {
  const dcel = new DCEL();
  const points = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
  ];
  dcel.createPolygon(points);
  return dcel;
};
