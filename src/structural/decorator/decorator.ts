/**
 * Decorator — attaches additional responsibilities to an object dynamically.
 * Provides a flexible alternative to subclassing for extending functionality.
 *
 * Use case: A coffee ordering system where any combination of extras (milk,
 * sugar, whipped cream) can be added to any base drink at runtime.
 */

interface Beverage {
  description(): string;
  cost(): number;
}

// --- Concrete components ---

class Espresso implements Beverage {
  description(): string { return "Espresso"; }
  cost(): number        { return 1.99; }
}

class HouseBlend implements Beverage {
  description(): string { return "House Blend Coffee"; }
  cost(): number        { return 0.89; }
}

// --- Base decorator — satisfies the interface and wraps a component ---

abstract class BeverageDecorator implements Beverage {
  constructor(protected wrapped: Beverage) {}
  abstract description(): string;
  abstract cost(): number;
}

// --- Concrete decorators ---

class Milk extends BeverageDecorator {
  description(): string { return `${this.wrapped.description()}, Milk`; }
  cost(): number        { return this.wrapped.cost() + 0.25; }
}

class Sugar extends BeverageDecorator {
  description(): string { return `${this.wrapped.description()}, Sugar`; }
  cost(): number        { return this.wrapped.cost() + 0.10; }
}

class WhippedCream extends BeverageDecorator {
  description(): string { return `${this.wrapped.description()}, Whipped Cream`; }
  cost(): number        { return this.wrapped.cost() + 0.50; }
}

class Vanilla extends BeverageDecorator {
  description(): string { return `${this.wrapped.description()}, Vanilla`; }
  cost(): number        { return this.wrapped.cost() + 0.35; }
}

function printOrder(beverage: Beverage): void {
  console.log(`  ${beverage.description()}`);
  console.log(`  $${beverage.cost().toFixed(2)}\n`);
}

// --- Demo ---

console.log("Order 1: Plain espresso");
printOrder(new Espresso());

console.log("Order 2: House blend + milk + sugar");
printOrder(new Sugar(new Milk(new HouseBlend())));

console.log("Order 3: Double-whipped vanilla espresso");
printOrder(new Vanilla(new WhippedCream(new WhippedCream(new Espresso()))));
