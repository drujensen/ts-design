/**
 * Strategy — defines a family of algorithms, encapsulates each one, and makes
 * them interchangeable. Lets the algorithm vary independently from clients.
 *
 * Use case: A shipping cost calculator that supports multiple carriers.
 * The carrier (strategy) can be swapped without changing the order logic.
 */

interface ShippingStrategy {
  name: string;
  calculate(weightKg: number, distanceKm: number): number;
}

// --- Concrete strategies ---

class StandardShipping implements ShippingStrategy {
  name = "Standard (5-7 days)";
  calculate(weightKg: number, _distanceKm: number): number {
    return 3.99 + weightKg * 0.50;
  }
}

class ExpressShipping implements ShippingStrategy {
  name = "Express (2 days)";
  calculate(weightKg: number, distanceKm: number): number {
    return 9.99 + weightKg * 1.25 + distanceKm * 0.01;
  }
}

class OvernightShipping implements ShippingStrategy {
  name = "Overnight (next day)";
  calculate(weightKg: number, distanceKm: number): number {
    return 24.99 + weightKg * 2.00 + distanceKm * 0.02;
  }
}

class FreeShipping implements ShippingStrategy {
  name = "Free Shipping (7-14 days)";
  calculate(_weightKg: number, _distanceKm: number): number {
    return 0;
  }
}

// --- Context ---

class ShippingCalculator {
  constructor(private strategy: ShippingStrategy) {}

  setStrategy(strategy: ShippingStrategy): void {
    this.strategy = strategy;
  }

  calculateCost(weightKg: number, distanceKm: number): number {
    return this.strategy.calculate(weightKg, distanceKm);
  }

  getStrategyName(): string { return this.strategy.name; }
}

// Helper to compare all strategies for a given shipment.
function compareStrategies(
  strategies: ShippingStrategy[],
  weightKg: number,
  distanceKm: number,
): void {
  console.log(`\nShipment: ${weightKg}kg, ${distanceKm}km`);
  const calc = new ShippingCalculator(strategies[0]!);
  for (const strategy of strategies) {
    calc.setStrategy(strategy);
    const cost = calc.calculateCost(weightKg, distanceKm);
    console.log(`  ${strategy.name.padEnd(30)} $${cost.toFixed(2)}`);
  }
}

// --- Demo ---

const strategies: ShippingStrategy[] = [
  new FreeShipping(),
  new StandardShipping(),
  new ExpressShipping(),
  new OvernightShipping(),
];

compareStrategies(strategies, 0.5, 200);  // light parcel
compareStrategies(strategies, 5.0, 500);  // heavy parcel, long distance

// Switch strategy at runtime based on business rule (order total > $100 → free)
const orderTotal = 120;
const calc = new ShippingCalculator(new StandardShipping());

if (orderTotal >= 100) {
  calc.setStrategy(new FreeShipping());
}

console.log(`\nOrder total $${orderTotal} → using: ${calc.getStrategyName()}`);
console.log(`Cost: $${calc.calculateCost(1.2, 300).toFixed(2)}`);
