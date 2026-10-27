/**
 * Interpreter — given a language, defines a representation for its grammar
 * along with an interpreter that uses the representation to interpret sentences.
 *
 * Use case: A simple arithmetic expression evaluator that supports +, -, *, /
 * and variables stored in a context.
 */

type Context = Map<string, number>;

interface Expression {
  interpret(context: Context): number;
}

// --- Terminal expressions (leaves) ---

class NumberExpression implements Expression {
  constructor(private value: number) {}
  interpret(_context: Context): number { return this.value; }
}

class VariableExpression implements Expression {
  constructor(private name: string) {}
  interpret(context: Context): number {
    const val = context.get(this.name);
    if (val === undefined) throw new Error(`Undefined variable: ${this.name}`);
    return val;
  }
}

// --- Non-terminal expressions (composites) ---

class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Context): number {
    return this.left.interpret(ctx) + this.right.interpret(ctx);
  }
}

class SubtractExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Context): number {
    return this.left.interpret(ctx) - this.right.interpret(ctx);
  }
}

class MultiplyExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Context): number {
    return this.left.interpret(ctx) * this.right.interpret(ctx);
  }
}

class DivideExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Context): number {
    const divisor = this.right.interpret(ctx);
    if (divisor === 0) throw new Error("Division by zero");
    return this.left.interpret(ctx) / divisor;
  }
}

// --- Simple parser for infix expressions like "x + 2 * y" ---
// (handles only single-space-separated tokens, left-to-right, no precedence)

function parse(tokens: string[]): Expression {
  let left: Expression = parseAtom(tokens.shift()!);

  while (tokens.length >= 2) {
    const op   = tokens.shift()!;
    const right = parseAtom(tokens.shift()!);
    switch (op) {
      case "+": left = new AddExpression(left, right);      break;
      case "-": left = new SubtractExpression(left, right); break;
      case "*": left = new MultiplyExpression(left, right); break;
      case "/": left = new DivideExpression(left, right);   break;
      default:  throw new Error(`Unknown operator: ${op}`);
    }
  }
  return left;
}

function parseAtom(token: string): Expression {
  const n = Number(token);
  return isNaN(n) ? new VariableExpression(token) : new NumberExpression(n);
}

// --- Demo ---

const context: Context = new Map([["x", 10], ["y", 4], ["z", 2]]);

const expressions = [
  "x + y",           // 14
  "x - z",           // 8
  "y * z",           // 8
  "x / z",           // 5
  "x + y * z",       // (10+4)*2 = 28  (left-to-right, no precedence)
];

for (const expr of expressions) {
  const ast = parse(expr.split(" "));
  console.log(`  ${expr.padEnd(15)} = ${ast.interpret(context)}`);
}

// Build an AST programmatically — (x + y) * z
const programmatic = new MultiplyExpression(
  new AddExpression(new VariableExpression("x"), new VariableExpression("y")),
  new VariableExpression("z"),
);
console.log(`\n  (x + y) * z = ${programmatic.interpret(context)}`); // (10+4)*2 = 28
