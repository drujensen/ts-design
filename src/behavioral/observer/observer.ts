/**
 * Observer — defines a one-to-many dependency between objects so that when
 * one object changes state, all its dependents are notified automatically.
 *
 * Use case: A stock ticker that notifies multiple widgets whenever a price changes.
 * Also shows TypeScript's typed EventEmitter pattern.
 */

// --- Generic Observer/Subject interfaces ---

interface Observer<T> {
  update(event: string, data: T): void;
}

interface Subject<T> {
  subscribe(event: string, observer: Observer<T>): void;
  unsubscribe(event: string, observer: Observer<T>): void;
  notify(event: string, data: T): void;
}

// --- Generic EventEmitter base ---

class EventEmitter<T> implements Subject<T> {
  private listeners = new Map<string, Set<Observer<T>>>();

  subscribe(event: string, observer: Observer<T>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(observer);
  }

  unsubscribe(event: string, observer: Observer<T>): void {
    this.listeners.get(event)?.delete(observer);
  }

  notify(event: string, data: T): void {
    this.listeners.get(event)?.forEach(obs => obs.update(event, data));
  }
}

// --- Domain: Stock Ticker ---

interface StockUpdate {
  symbol: string;
  price: number;
  change: number;
}

class StockMarket extends EventEmitter<StockUpdate> {
  private prices = new Map<string, number>();

  setPrice(symbol: string, newPrice: number): void {
    const old = this.prices.get(symbol) ?? newPrice;
    const change = parseFloat((newPrice - old).toFixed(2));
    this.prices.set(symbol, newPrice);
    this.notify("priceUpdate", { symbol, price: newPrice, change });
  }
}

// --- Concrete Observers ---

class PriceDisplay implements Observer<StockUpdate> {
  constructor(private label: string) {}

  update(_event: string, data: StockUpdate): void {
    const arrow = data.change >= 0 ? "▲" : "▼";
    console.log(`  [${this.label}] ${data.symbol}: $${data.price.toFixed(2)} ${arrow}${Math.abs(data.change).toFixed(2)}`);
  }
}

class AlertSystem implements Observer<StockUpdate> {
  constructor(private threshold: number) {}

  update(_event: string, data: StockUpdate): void {
    if (Math.abs(data.change) >= this.threshold) {
      console.log(`  *** ALERT: ${data.symbol} moved $${data.change} (threshold: $${this.threshold}) ***`);
    }
  }
}

class AuditLog implements Observer<StockUpdate> {
  private log: string[] = [];

  update(event: string, data: StockUpdate): void {
    this.log.push(`${event}: ${data.symbol} @ $${data.price}`);
  }

  dump(): void {
    console.log("  Audit log:", this.log.join(" | "));
  }
}

// --- Demo ---

const market  = new StockMarket();
const display = new PriceDisplay("Dashboard");
const mobile  = new PriceDisplay("Mobile App");
const alerts  = new AlertSystem(5);
const audit   = new AuditLog();

market.subscribe("priceUpdate", display);
market.subscribe("priceUpdate", mobile);
market.subscribe("priceUpdate", alerts);
market.subscribe("priceUpdate", audit);

console.log("--- Price updates ---");
market.setPrice("AAPL", 175.00);
market.setPrice("AAPL", 178.50);
market.setPrice("TSLA", 250.00);
market.setPrice("TSLA", 242.00); // large drop — alert fires

console.log("\n--- Mobile unsubscribes ---");
market.unsubscribe("priceUpdate", mobile);
market.setPrice("AAPL", 180.00); // only display + alerts + audit notified

console.log();
audit.dump();
