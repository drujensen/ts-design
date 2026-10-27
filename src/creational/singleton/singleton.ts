/**
 * Singleton — ensures a class has only one instance and provides a global access point.
 *
 * Use case: Application-wide logger that writes to a single output stream.
 * Without Singleton, multiple Logger instances could interleave output or open
 * duplicate file handles.
 */

type LogLevel = "info" | "warn" | "error";

class Logger {
  private static instance: Logger | null = null;
  private logs: string[] = [];

  // Private constructor prevents `new Logger()` from outside.
  private constructor(private readonly prefix: string) {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger("[APP]");
    }
    return Logger.instance;
  }

  log(level: LogLevel, message: string): void {
    const entry = `${this.prefix} [${level.toUpperCase()}] ${message}`;
    this.logs.push(entry);
    console.log(entry);
  }

  getHistory(): readonly string[] {
    return this.logs;
  }
}

// --- Demo ---

const loggerA = Logger.getInstance();
const loggerB = Logger.getInstance();

loggerA.log("info", "Application started");
loggerB.log("warn", "Low memory warning");
loggerA.log("error", "Database connection failed");

console.log("\nSame instance?", loggerA === loggerB); // true — same reference
console.log("\nLog history:");
loggerA.getHistory().forEach((entry) => console.log(" ", entry));
