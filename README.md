# TypeScript Design Patterns

A collection of practical implementations of the classic Gang of Four design patterns in modern TypeScript. Each example is intentionally self-contained and demonstrates the pattern in a realistic, easy-to-follow scenario.

## Patterns included

### Creational

- **Abstract Factory** — creates families of related UI components for light and dark themes.
- **Builder** — constructs SQL-like queries step by step.
- **Factory Method** — creates notifications for email, SMS, and push channels.
- **Prototype** — clones configurable objects without coupling callers to concrete classes.
- **Singleton** — provides a single shared configuration instance.

### Structural

- **Adapter** — makes an incompatible legacy payment API work with a modern interface.
- **Bridge** — separates notification abstractions from delivery implementations.
- **Composite** — treats individual files and directory trees uniformly.
- **Decorator** — adds features such as compression and encryption around a data source.
- **Facade** — provides a simple interface over a multi-step order checkout workflow.
- **Flyweight** — shares intrinsic formatting data across many document characters.
- **Proxy** — adds caching and access control around a remote service.

### Behavioral

- **Chain of Responsibility** — passes HTTP requests through authentication, rate-limiting, and logging handlers.
- **Command** — encapsulates text-editing operations and supports undo/redo.
- **Interpreter** — evaluates arithmetic expressions and variables.
- **Iterator** — lazily iterates over paginated user data.
- **Mediator** — coordinates chat-room communication without direct user-to-user coupling.
- **Memento** — saves and restores form-wizard state.
- **Observer** — publishes typed events to subscribed observers.
- **State** — models a vending machine whose behavior changes with its state.
- **Strategy** — swaps shipping-cost algorithms without changing the order logic.
- **Template Method** — defines a fixed data-import workflow with format-specific steps.
- **Visitor** — applies multiple operations to an expression AST without changing its node classes.

## Requirements

- Node.js 18 or later
- TypeScript 5 or later

No runtime dependencies are required. The repository does not include a package manifest; use `npx` or a globally installed TypeScript compiler.

## Getting started

Clone the repository and install TypeScript if it is not already available:

```bash
git clone git@github-personal:drujensen/ts-design.git
cd ts-design
npm install --save-dev typescript
```

Compile all examples:

```bash
npx tsc
```

Compiled JavaScript, declarations, and source maps are written to `dist/` according to [`tsconfig.json`](./tsconfig.json).

To run an individual example after compilation, use Node.js with the corresponding file in `dist/`:

```bash
node dist/behavioral/strategy/strategy.js
```

The examples contain their demonstrations in the source files, so they can also be read independently without running the complete project.

## Project layout

```text
src/
├── behavioral/
├── creational/
└── structural/
```

Each pattern lives in a directory named after the pattern and has a matching `.ts` source file. The compiler is configured with strict type checking and emits ES modules, declarations, and source maps.

## Learning with the examples

Each source file begins with a short description of the pattern and a practical use case. A useful way to explore the project is to:

1. Read the pattern overview at the top of a source file.
2. Identify the interfaces or abstract classes that define the collaboration.
3. Follow the concrete implementations and the client code at the bottom.
4. Modify the example to experiment with another implementation or use case.

These examples favor clarity over framework integration and are intended as a reference for learning, discussion, and experimentation.

## License

No license has been specified yet.
