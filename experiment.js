class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
}

class PolygonTriangulation {
    constructor(points) {
        this.points = points;
        this.n = points.length;
    }

    isTriangleOrientedCCW(p1, p2, p3) {
        return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) > 0;
    }

    pointInTriangle(p, a, b, c) {
        const sign = (p1, p2, p3) => {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        };

        const d1 = sign(p, a, b);
        const d2 = sign(p, b, c);
        const d3 = sign(p, c, a);

        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(hasNeg && hasPos);
    }

    isEar(i, remainingVertices) {
        const vertices = remainingVertices || [...Array(this.n).keys()];
        const idx = remainingVertices ? vertices.indexOf(i) : i;
        const prev = vertices[(idx - 1 + vertices.length) % vertices.length];
        const next = vertices[(idx + 1) % vertices.length];

        // Check if triangle is oriented correctly
        if (!this.isTriangleOrientedCCW(
            this.points[prev],
            this.points[i],
            this.points[next]
        )) {
            return false;
        }

        // Check if any other point lies inside this triangle
        for (const j of vertices) {
            if (j !== i && j !== prev && j !== next) {
                if (this.pointInTriangle(
                    this.points[j],
                    this.points[prev],
                    this.points[i],
                    this.points[next]
                )) {
                    return false;
                }
            }
        }
        return true;
    }

    naiveTriangulation() {
        if (this.n < 3) return [];

        const remainingVertices = [...Array(this.n).keys()];
        const triangles = [];

        while (remainingVertices.length > 3) {
            let foundEar = false;
            for (let i = 0; i < remainingVertices.length; i++) {
                const vertex = remainingVertices[i];
                if (this.isEar(vertex, remainingVertices)) {
                    const prev = remainingVertices[(i - 1 + remainingVertices.length) % remainingVertices.length];
                    const next = remainingVertices[(i + 1) % remainingVertices.length];
                    triangles.push(new Triangle(
                        this.points[prev],
                        this.points[vertex],
                        this.points[next]
                    ));
                    remainingVertices.splice(i, 1);
                    foundEar = true;
                    break;
                }
            }
            if (!foundEar) {
                throw new Error("No ear found - polygon may be invalid");
            }
        }

        // Add final triangle
        triangles.push(new Triangle(
            this.points[remainingVertices[0]],
            this.points[remainingVertices[1]],
            this.points[remainingVertices[2]]
        ));

        return triangles;
    }

    improvedTriangulation() {
        if (this.n < 3) return [];

        // Pre-compute convex/concave vertices
        const isConvex = new Array(this.n).fill(false);
        for (let i = 0; i < this.n; i++) {
            const prev = (i - 1 + this.n) % this.n;
            const next = (i + 1) % this.n;
            isConvex[i] = this.isTriangleOrientedCCW(
                this.points[prev],
                this.points[i],
                this.points[next]
            );
        }

        const remainingVertices = [...Array(this.n).keys()];
        const triangles = [];

        while (remainingVertices.length > 3) {
            let foundEar = false;

            // First try convex vertices
            for (let i = 0; i < remainingVertices.length; i++) {
                const vertex = remainingVertices[i];
                if (isConvex[vertex] && this.isEar(vertex, remainingVertices)) {
                    const prev = remainingVertices[(i - 1 + remainingVertices.length) % remainingVertices.length];
                    const next = remainingVertices[(i + 1) % remainingVertices.length];
                    
                    triangles.push(new Triangle(
                        this.points[prev],
                        this.points[vertex],
                        this.points[next]
                    ));

                    // Update convexity of adjacent vertices
                    const prevIdx = (i - 1 + remainingVertices.length) % remainingVertices.length;
                    const nextIdx = (i + 1) % remainingVertices.length;

                    if (prevIdx > 0) {
                        const prevPrev = remainingVertices[prevIdx - 1];
                        isConvex[prev] = this.isTriangleOrientedCCW(
                            this.points[prevPrev],
                            this.points[prev],
                            this.points[next]
                        );
                    }

                    if (nextIdx < remainingVertices.length - 1) {
                        const nextNext = remainingVertices[nextIdx + 1];
                        isConvex[next] = this.isTriangleOrientedCCW(
                            this.points[prev],
                            this.points[next],
                            this.points[nextNext]
                        );
                    }

                    remainingVertices.splice(i, 1);
                    foundEar = true;
                    break;
                }
            }

            // If no convex ear found, try concave vertices
            if (!foundEar) {
                for (let i = 0; i < remainingVertices.length; i++) {
                    const vertex = remainingVertices[i];
                    if (!isConvex[vertex] && this.isEar(vertex, remainingVertices)) {
                        const prev = remainingVertices[(i - 1 + remainingVertices.length) % remainingVertices.length];
                        const next = remainingVertices[(i + 1) % remainingVertices.length];
                        triangles.push(new Triangle(
                            this.points[prev],
                            this.points[vertex],
                            this.points[next]
                        ));
                        remainingVertices.splice(i, 1);
                        foundEar = true;
                        break;
                    }
                }
            }

            if (!foundEar) {
                throw new Error("No ear found - polygon may be invalid");
            }
        }

        // Add final triangle
        triangles.push(new Triangle(
            this.points[remainingVertices[0]],
            this.points[remainingVertices[1]],
            this.points[remainingVertices[2]]
        ));

        return triangles;
    }
}

// Helper function to generate random polygon
function generateRandomPolygon(n) {
    // Generate points on a circle with some noise
    const points = [];
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * 2 * Math.PI;
        const radius = 1.0;
        const noise = 0.1;
        const x = radius * Math.cos(angle) + (Math.random() - 0.5) * noise;
        const y = radius * Math.sin(angle) + (Math.random() - 0.5) * noise;
        points.push(new Point(x, y));
    }
    return points;
}

// Test function
function runExperiments() {
    const sizes = [10, 20, 50, 100, 200];
    
    for (const size of sizes) {
        console.log(`\nTesting with polygon size: ${size}`);
        const points = generateRandomPolygon(size);
        const triangulator = new PolygonTriangulation(points);

        // Test naive algorithm
        console.time('Naive algorithm');
        const naiveTriangles = triangulator.naiveTriangulation();
        console.timeEnd('Naive algorithm');
        console.log(`Naive triangulation produced ${naiveTriangles.length} triangles`);

        // Test improved algorithm
        console.time('Improved algorithm');
        const improvedTriangles = triangulator.improvedTriangulation();
        console.timeEnd('Improved algorithm');
        console.log(`Improved triangulation produced ${improvedTriangles.length} triangles`);
    }
}

// Run the experiments
runExperiments();