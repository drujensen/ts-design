/**
 * Template Method — defines the skeleton of an algorithm in a base class,
 * deferring some steps to subclasses. Subclasses can redefine certain steps
 * without changing the algorithm's structure.
 *
 * Use case: A data import pipeline where the overall steps (open → validate →
 * parse → transform → save → close) are fixed, but each format implements
 * its own parsing and transformation.
 */

interface Record {
  id: string;
  name: string;
  value: number;
}

// The abstract class defines the template method and abstract steps.
abstract class DataImporter {
  // Template method — final algorithm skeleton, not overridable.
  import(source: string): void {
    console.log(`\n--- Importing from: ${source} ---`);
    const raw       = this.openSource(source);
    const valid     = this.validate(raw);
    if (!valid) { console.log("  Validation failed. Aborting."); return; }
    const parsed    = this.parse(raw);
    const records   = this.transform(parsed);
    this.save(records);
    this.closeSource();
    console.log(`  Done. ${records.length} records imported.`);
  }

  // --- Abstract steps — subclasses must implement ---
  protected abstract parse(raw: string): unknown[];
  protected abstract transform(rows: unknown[]): Record[];

  // --- Hook — optional override with default behavior ---
  protected validate(raw: string): boolean {
    return raw.trim().length > 0; // default: non-empty
  }

  // --- Concrete steps — shared by all importers ---
  private openSource(source: string): string {
    console.log(`  [open] ${source}`);
    // Simulate reading file content
    return source.includes("csv")
      ? "1,Alice,100\n2,Bob,200\n3,Carol,300"
      : '{"records":[{"id":"1","name":"Alice","value":100},{"id":"2","name":"Bob","value":200}]}';
  }

  private save(records: Record[]): void {
    records.forEach(r => console.log(`  [save] ${r.id}: ${r.name} = ${r.value}`));
  }

  private closeSource(): void {
    console.log("  [close] Source released");
  }
}

// --- Concrete importers ---

class CsvImporter extends DataImporter {
  protected parse(raw: string): string[][] {
    return raw.split("\n").map(line => line.split(","));
  }

  protected transform(rows: unknown[]): Record[] {
    return (rows as string[][]).map(([id, name, value]) => ({
      id:    id?.trim() ?? "",
      name:  name?.trim() ?? "",
      value: parseInt(value?.trim() ?? "0", 10),
    }));
  }
}

class JsonImporter extends DataImporter {
  protected parse(raw: string): unknown[] {
    const parsed = JSON.parse(raw) as { records: unknown[] };
    return parsed.records;
  }

  protected transform(rows: unknown[]): Record[] {
    return rows.map(row => {
      const r = row as { id: string; name: string; value: number };
      return { id: r.id, name: r.name, value: r.value * 1.1 }; // apply 10% markup
    });
  }

  // Override the validation hook to also check JSON structure.
  protected override validate(raw: string): boolean {
    try {
      const obj = JSON.parse(raw) as unknown;
      return typeof obj === "object" && obj !== null && "records" in obj;
    } catch {
      return false;
    }
  }
}

// --- Demo ---

const csvImporter  = new CsvImporter();
const jsonImporter = new JsonImporter();

csvImporter.import("data.csv");
jsonImporter.import("data.json");

// Test validation rejection
csvImporter.import("   "); // empty — validation fails
