/**
 * Flyweight — uses sharing to efficiently support a large number of fine-grained
 * objects by separating intrinsic (shared) state from extrinsic (unique) state.
 *
 * Use case: A forest of 1 million trees. Each tree shares species data (texture,
 * color) via a Flyweight; only position/size (extrinsic) is stored per instance.
 */

// --- Intrinsic state — heavy, shared across many trees ---

class TreeType {
  constructor(
    public readonly name: string,
    public readonly color: string,
    public readonly texture: string, // imagine a large blob
  ) {}

  draw(x: number, y: number, size: number): void {
    console.log(`Drawing ${this.name} [${this.color}/${this.texture}] at (${x},${y}) size=${size}`);
  }
}

// --- Flyweight factory — ensures TreeType instances are shared ---

class TreeTypeFactory {
  private static cache = new Map<string, TreeType>();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}|${color}|${texture}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new TreeType(name, color, texture));
      console.log(`  [Factory] Created new TreeType: ${key}`);
    }
    return this.cache.get(key)!;
  }

  static getCacheSize(): number { return this.cache.size; }
}

// --- Extrinsic state — lightweight, one per tree instance ---

class Tree {
  constructor(
    private readonly x: number,
    private readonly y: number,
    private readonly size: number,
    private readonly type: TreeType,
  ) {}

  draw(): void {
    this.type.draw(this.x, this.y, this.size);
  }
}

class Forest {
  private trees: Tree[] = [];

  plantTree(x: number, y: number, size: number, name: string, color: string, texture: string): void {
    const type = TreeTypeFactory.getTreeType(name, color, texture);
    this.trees.push(new Tree(x, y, size, type));
  }

  draw(): void {
    this.trees.forEach(t => t.draw());
  }

  get treeCount(): number { return this.trees.length; }
}

// --- Demo ---

const forest = new Forest();

// Plant 6 trees of only 2 species — TreeType objects are shared.
forest.plantTree(10, 20, 5, "Oak",  "dark-green", "rough-bark");
forest.plantTree(30, 15, 3, "Pine", "light-green", "smooth-bark");
forest.plantTree(50, 40, 7, "Oak",  "dark-green", "rough-bark");
forest.plantTree(70, 10, 4, "Pine", "light-green", "smooth-bark");
forest.plantTree(90, 55, 6, "Oak",  "dark-green", "rough-bark");
forest.plantTree(20, 80, 5, "Pine", "light-green", "smooth-bark");

console.log("\n--- Drawing forest ---");
forest.draw();

console.log(`\nTrees planted : ${forest.treeCount}`);
console.log(`TreeType objects created: ${TreeTypeFactory.getCacheSize()} (shared, not 6)`);
