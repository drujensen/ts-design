/**
 * Visitor — lets you add further operations to objects without modifying them.
 * Separates the algorithm from the object structure it operates on.
 *
 * Use case: An AST (Abstract Syntax Tree) for a simple expression language.
 * Different visitors (type-checker, evaluator, pretty-printer) traverse the
 * same nodes without changing the node classes.
 */

// --- Visitor interface — one method per node type ---

interface AstVisitor<T> {
  visitNumber(node: NumberNode): T;
  visitBinary(node: BinaryNode): T;
  visitVariable(node: VariableNode): T;
  visitAssignment(node: AssignmentNode): T;
}

// --- AST Nodes (Elements) ---

interface AstNode {
  accept<T>(visitor: AstVisitor<T>): T;
}

class NumberNode implements AstNode {
  constructor(public readonly value: number) {}
  accept<T>(visitor: AstVisitor<T>): T { return visitor.visitNumber(this); }
}

class VariableNode implements AstNode {
  constructor(public readonly name: string) {}
  accept<T>(visitor: AstVisitor<T>): T { return visitor.visitVariable(this); }
}

class BinaryNode implements AstNode {
  constructor(
    public readonly op: "+" | "-" | "*" | "/",
    public readonly left: AstNode,
    public readonly right: AstNode,
  ) {}
  accept<T>(visitor: AstVisitor<T>): T { return visitor.visitBinary(this); }
}

class AssignmentNode implements AstNode {
  constructor(
    public readonly name: string,
    public readonly value: AstNode,
  ) {}
  accept<T>(visitor: AstVisitor<T>): T { return visitor.visitAssignment(this); }
}

// --- Visitor 1: Pretty Printer ---

class PrettyPrinter implements AstVisitor<string> {
  visitNumber(node: NumberNode): string   { return String(node.value); }
  visitVariable(node: VariableNode): string { return node.name; }
  visitBinary(node: BinaryNode): string {
    return `(${node.left.accept(this)} ${node.op} ${node.right.accept(this)})`;
  }
  visitAssignment(node: AssignmentNode): string {
    return `${node.name} = ${node.value.accept(this)}`;
  }
}

// --- Visitor 2: Evaluator ---

class Evaluator implements AstVisitor<number> {
  constructor(private env: Map<string, number> = new Map()) {}

  visitNumber(node: NumberNode): number   { return node.value; }
  visitVariable(node: VariableNode): number {
    const val = this.env.get(node.name);
    if (val === undefined) throw new Error(`Undefined: ${node.name}`);
    return val;
  }
  visitBinary(node: BinaryNode): number {
    const l = node.left.accept(this);
    const r = node.right.accept(this);
    switch (node.op) {
      case "+": return l + r;
      case "-": return l - r;
      case "*": return l * r;
      case "/": return l / r;
    }
  }
  visitAssignment(node: AssignmentNode): number {
    const val = node.value.accept(this);
    this.env.set(node.name, val);
    return val;
  }
}

// --- Visitor 3: Variable Collector ---

class VariableCollector implements AstVisitor<Set<string>> {
  visitNumber(_node: NumberNode): Set<string>   { return new Set(); }
  visitVariable(node: VariableNode): Set<string> { return new Set([node.name]); }
  visitBinary(node: BinaryNode): Set<string> {
    return new Set([...node.left.accept(this), ...node.right.accept(this)]);
  }
  visitAssignment(node: AssignmentNode): Set<string> {
    return new Set([node.name, ...node.value.accept(this)]);
  }
}

// --- Demo ---

// Build AST for: result = (x + 2) * (y - z)
const ast: AstNode = new AssignmentNode(
  "result",
  new BinaryNode("*",
    new BinaryNode("+", new VariableNode("x"), new NumberNode(2)),
    new BinaryNode("-", new VariableNode("y"), new VariableNode("z")),
  ),
);

const printer   = new PrettyPrinter();
const evaluator = new Evaluator(new Map([["x", 3], ["y", 10], ["z", 4]]));
const collector = new VariableCollector();

console.log("AST:");
console.log(" ", ast.accept(printer));

console.log("\nVariables referenced:");
console.log(" ", [...ast.accept(collector)].join(", "));

console.log("\nEvaluation (x=3, y=10, z=4):");
console.log(" result =", ast.accept(evaluator)); // (3+2)*(10-4) = 5*6 = 30
