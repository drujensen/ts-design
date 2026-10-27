/**
 * Bridge — decouples an abstraction from its implementation so that the two can
 * vary independently.
 *
 * Use case: Shapes (Circle, Square) need to be rendered in different ways
 * (SVG, Canvas). Without Bridge, you'd need CircleSVG, CircleCanvas, SquareSVG,
 * SquareCanvas — 2×2 classes. Bridge reduces it to 2 + 2.
 */

// --- Implementation hierarchy (the "bridge" side) ---

interface Renderer {
  renderCircle(x: number, y: number, radius: number): void;
  renderRectangle(x: number, y: number, w: number, h: number): void;
}

class SvgRenderer implements Renderer {
  renderCircle(x: number, y: number, radius: number): void {
    console.log(`<circle cx="${x}" cy="${y}" r="${radius}" />`);
  }
  renderRectangle(x: number, y: number, w: number, h: number): void {
    console.log(`<rect x="${x}" y="${y}" width="${w}" height="${h}" />`);
  }
}

class CanvasRenderer implements Renderer {
  renderCircle(x: number, y: number, radius: number): void {
    console.log(`ctx.arc(${x}, ${y}, ${radius}, 0, Math.PI*2); ctx.fill();`);
  }
  renderRectangle(x: number, y: number, w: number, h: number): void {
    console.log(`ctx.fillRect(${x}, ${y}, ${w}, ${h});`);
  }
}

// --- Abstraction hierarchy (the shape side) ---

abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void;
  abstract resize(factor: number): void;
}

class Circle extends Shape {
  constructor(
    renderer: Renderer,
    private x: number,
    private y: number,
    private radius: number,
  ) {
    super(renderer);
  }

  draw(): void {
    this.renderer.renderCircle(this.x, this.y, this.radius);
  }

  resize(factor: number): void {
    this.radius *= factor;
  }
}

class Rectangle extends Shape {
  constructor(
    renderer: Renderer,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
  ) {
    super(renderer);
  }

  draw(): void {
    this.renderer.renderRectangle(this.x, this.y, this.width, this.height);
  }

  resize(factor: number): void {
    this.width  *= factor;
    this.height *= factor;
  }
}

// --- Demo ---

const svgRenderer    = new SvgRenderer();
const canvasRenderer = new CanvasRenderer();

console.log("=== SVG ===");
const svgCircle = new Circle(svgRenderer, 50, 50, 30);
const svgRect   = new Rectangle(svgRenderer, 10, 10, 80, 40);
svgCircle.draw();
svgRect.draw();

console.log("\n=== Canvas ===");
const canvasCircle = new Circle(canvasRenderer, 50, 50, 30);
const canvasRect   = new Rectangle(canvasRenderer, 10, 10, 80, 40);
canvasCircle.resize(2);
canvasCircle.draw();
canvasRect.draw();
