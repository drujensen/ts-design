/**
 * Command — encapsulates a request as an object, letting you parameterize
 * clients with different requests, queue operations, and support undo/redo.
 *
 * Use case: A text editor where every edit is a Command object, enabling
 * an undo/redo stack.
 */

interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

class TextDocument {
  private content = "";

  insert(pos: number, text: string): void {
    this.content = this.content.slice(0, pos) + text + this.content.slice(pos);
  }

  delete(pos: number, length: number): void {
    this.content = this.content.slice(0, pos) + this.content.slice(pos + length);
  }

  replace(search: string, replacement: string): number {
    const idx = this.content.indexOf(search);
    if (idx === -1) return -1;
    this.content = this.content.slice(0, idx) + replacement + this.content.slice(idx + search.length);
    return idx;
  }

  getContent(): string { return this.content; }
}

// --- Concrete commands ---

class InsertCommand implements Command {
  description: string;

  constructor(
    private doc: TextDocument,
    private position: number,
    private text: string,
  ) {
    this.description = `Insert "${text}" at ${position}`;
  }

  execute(): void { this.doc.insert(this.position, this.text); }
  undo(): void    { this.doc.delete(this.position, this.text.length); }
}

class DeleteCommand implements Command {
  description: string;
  private deletedText = "";

  constructor(
    private doc: TextDocument,
    private position: number,
    private length: number,
  ) {
    this.description = `Delete ${length} chars at ${position}`;
  }

  execute(): void {
    this.deletedText = this.doc.getContent().slice(this.position, this.position + this.length);
    this.doc.delete(this.position, this.length);
  }

  undo(): void { this.doc.insert(this.position, this.deletedText); }
}

class ReplaceCommand implements Command {
  description: string;
  private originalPos = -1;

  constructor(
    private doc: TextDocument,
    private search: string,
    private replacement: string,
  ) {
    this.description = `Replace "${search}" with "${replacement}"`;
  }

  execute(): void {
    this.originalPos = this.doc.replace(this.search, this.replacement);
  }

  undo(): void {
    if (this.originalPos !== -1) {
      this.doc.replace(this.replacement, this.search);
    }
  }
}

// --- Invoker with undo/redo stack ---

class Editor {
  private doc = new TextDocument();
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  run(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack.length = 0; // clear redo on new action
    console.log(`  ✎  ${command.description}`);
    console.log(`     "${this.doc.getContent()}"`);
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) { console.log("  Nothing to undo"); return; }
    command.undo();
    this.redoStack.push(command);
    console.log(`  ↩  Undid: ${command.description}`);
    console.log(`     "${this.doc.getContent()}"`);
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) { console.log("  Nothing to redo"); return; }
    command.execute();
    this.undoStack.push(command);
    console.log(`  ↪  Redid: ${command.description}`);
    console.log(`     "${this.doc.getContent()}"`);
  }

  getContent(): string { return this.doc.getContent(); }
}

// --- Demo ---

const editor = new Editor();

console.log("--- Editing ---");
editor.run(new InsertCommand(editor["doc"], 0, "Hello"));
editor.run(new InsertCommand(editor["doc"], 5, ", World"));
editor.run(new ReplaceCommand(editor["doc"], "World", "TypeScript"));
editor.run(new DeleteCommand(editor["doc"], 7, 4)); // delete "Type"

console.log("\n--- Undo ×3 ---");
editor.undo();
editor.undo();
editor.undo();

console.log("\n--- Redo ×2 ---");
editor.redo();
editor.redo();
