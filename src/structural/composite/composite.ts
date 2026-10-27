/**
 * Composite — composes objects into tree structures to represent part-whole
 * hierarchies. Lets clients treat individual objects and compositions uniformly.
 *
 * Use case: A file system where files and directories are treated the same way
 * when computing size or listing contents.
 */

interface FileSystemNode {
  name: string;
  getSize(): number;
  print(indent?: number): void;
}

// --- Leaf ---

class File implements FileSystemNode {
  constructor(
    public readonly name: string,
    private readonly sizeBytes: number,
  ) {}

  getSize(): number {
    return this.sizeBytes;
  }

  print(indent = 0): void {
    console.log(`${"  ".repeat(indent)}📄 ${this.name} (${this.sizeBytes} B)`);
  }
}

// --- Composite ---

class Directory implements FileSystemNode {
  private children: FileSystemNode[] = [];

  constructor(public readonly name: string) {}

  add(node: FileSystemNode): this {
    this.children.push(node);
    return this;
  }

  remove(name: string): void {
    const idx = this.children.findIndex(c => c.name === name);
    if (idx !== -1) this.children.splice(idx, 1);
  }

  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  print(indent = 0): void {
    console.log(`${"  ".repeat(indent)}📁 ${this.name}/ (${this.getSize()} B)`);
    for (const child of this.children) {
      child.print(indent + 1);
    }
  }
}

// --- Demo ---

const root = new Directory("root");

const src = new Directory("src");
src.add(new File("main.ts",   1200));
src.add(new File("utils.ts",   800));

const assets = new Directory("assets");
const images = new Directory("images");
images.add(new File("logo.png",  45000));
images.add(new File("banner.jpg", 120000));
assets.add(images);
assets.add(new File("styles.css", 3400));

root
  .add(src)
  .add(assets)
  .add(new File("README.md", 2100))
  .add(new File("package.json", 650));

root.print();
console.log(`\nTotal size: ${root.getSize().toLocaleString()} bytes`);
