/**
 * State — allows an object to alter its behavior when its internal state changes.
 * The object will appear to change its class.
 *
 * Use case: A vending machine whose valid actions (insert coin, select item,
 * dispense) depend entirely on the current state.
 */

// Forward-declare the context so states can reference it.
class VendingMachine {
  private state: MachineState;
  private balance = 0;
  private inventory = new Map<string, number>([
    ["Cola", 3],
    ["Water", 5],
    ["Chips", 2],
  ]);

  private readonly PRICES: Record<string, number> = {
    Cola: 150, Water: 100, Chips: 200,
  };

  constructor() {
    this.state = new IdleState(this);
  }

  setState(state: MachineState): void {
    console.log(`  [State] → ${state.constructor.name}`);
    this.state = state;
  }

  insertCoin(cents: number): void         { this.state.insertCoin(cents); }
  selectItem(item: string): void          { this.state.selectItem(item); }
  dispense(): void                        { this.state.dispense(); }
  cancelAndRefund(): void                 { this.state.cancelAndRefund(); }

  addBalance(cents: number): void         { this.balance += cents; }
  getBalance(): number                    { return this.balance; }
  setBalance(cents: number): void        { this.balance = cents; }

  getPrice(item: string): number | undefined { return this.PRICES[item]; }

  getStock(item: string): number {
    return this.inventory.get(item) ?? 0;
  }

  decrementStock(item: string): void {
    this.inventory.set(item, (this.inventory.get(item) ?? 1) - 1);
  }

  status(): void {
    console.log(`  Balance: ${this.balance}¢  State: ${this.state.constructor.name}`);
  }
}

// --- State interface ---

abstract class MachineState {
  constructor(protected machine: VendingMachine) {}

  insertCoin(_cents: number): void  { console.log("  [!] Cannot insert coin now"); }
  selectItem(_item: string): void   { console.log("  [!] Cannot select item now"); }
  dispense(): void                  { console.log("  [!] Cannot dispense now"); }
  cancelAndRefund(): void           { console.log("  [!] Nothing to refund"); }
}

// --- Concrete states ---

class IdleState extends MachineState {
  override insertCoin(cents: number): void {
    this.machine.addBalance(cents);
    console.log(`  Inserted ${cents}¢. Balance: ${this.machine.getBalance()}¢`);
    this.machine.setState(new HasMoneyState(this.machine));
  }
}

class HasMoneyState extends MachineState {
  override insertCoin(cents: number): void {
    this.machine.addBalance(cents);
    console.log(`  Added ${cents}¢. Balance: ${this.machine.getBalance()}¢`);
  }

  override selectItem(item: string): void {
    const price = this.machine.getPrice(item);
    if (price === undefined) {
      console.log(`  Item "${item}" not found`);
      return;
    }
    if (this.machine.getBalance() < price) {
      console.log(`  Insufficient funds. Need ${price}¢, have ${this.machine.getBalance()}¢`);
      return;
    }
    if (this.machine.getStock(item) === 0) {
      console.log(`  "${item}" is out of stock`);
      return;
    }
    console.log(`  Selected "${item}" (${price}¢)`);
    this.machine.setBalance(this.machine.getBalance() - price);
    this.machine.decrementStock(item);
    this.machine.setState(new DispensingState(this.machine, item));
  }

  override cancelAndRefund(): void {
    const refund = this.machine.getBalance();
    this.machine.setBalance(0);
    console.log(`  Refunded ${refund}¢`);
    this.machine.setState(new IdleState(this.machine));
  }
}

class DispensingState extends MachineState {
  constructor(machine: VendingMachine, private item: string) { super(machine); }

  override dispense(): void {
    console.log(`  🥤 Dispensing "${this.item}"!`);
    const change = this.machine.getBalance();
    if (change > 0) {
      console.log(`  Returning ${change}¢ change`);
      this.machine.setBalance(0);
    }
    this.machine.setState(new IdleState(this.machine));
  }
}

// --- Demo ---

const vm = new VendingMachine();

console.log("--- Normal purchase ---");
vm.insertCoin(100);
vm.insertCoin(100);
vm.selectItem("Cola");  // 150¢
vm.dispense();

console.log("\n--- Insufficient funds ---");
vm.insertCoin(50);
vm.selectItem("Chips"); // needs 200¢

console.log("\n--- Cancel and refund ---");
vm.cancelAndRefund();

console.log("\n--- Invalid actions in wrong state ---");
vm.selectItem("Water"); // idle state — no money inserted
vm.dispense();
