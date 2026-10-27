/**
 * Memento — captures and externalizes an object's internal state so it can be
 * restored later, without violating encapsulation.
 *
 * Use case: A form wizard that lets the user step back to any previous state
 * without re-entering data.
 */

// The Memento holds a snapshot of FormState.
// It is opaque to everything except the Originator.
class FormMemento {
  constructor(private readonly state: Readonly<FormState>) {}

  getState(): Readonly<FormState> { return { ...this.state }; }
}

interface FormState {
  step: number;
  name: string;
  email: string;
  plan: string;
  paymentMethod: string;
}

// --- Originator ---

class WizardForm {
  private state: FormState = {
    step: 0,
    name: "",
    email: "",
    plan: "",
    paymentMethod: "",
  };

  fillStep1(name: string, email: string): void {
    this.state = { ...this.state, step: 1, name, email };
  }

  fillStep2(plan: string): void {
    this.state = { ...this.state, step: 2, plan };
  }

  fillStep3(paymentMethod: string): void {
    this.state = { ...this.state, step: 3, paymentMethod };
  }

  save(): FormMemento {
    return new FormMemento({ ...this.state });
  }

  restore(memento: FormMemento): void {
    this.state = { ...memento.getState() };
  }

  getState(): Readonly<FormState> { return { ...this.state }; }
  print(): void {
    console.log("  Form:", JSON.stringify(this.state));
  }
}

// --- Caretaker ---

class FormHistory {
  private history: FormMemento[] = [];

  push(memento: FormMemento): void {
    this.history.push(memento);
  }

  pop(): FormMemento | undefined {
    return this.history.pop();
  }

  get length(): number { return this.history.length; }
}

// --- Demo ---

const form    = new WizardForm();
const history = new FormHistory();

console.log("Step 0 — initial:");
history.push(form.save());
form.print();

console.log("\nStep 1 — personal info:");
form.fillStep1("Alice", "alice@example.com");
history.push(form.save());
form.print();

console.log("\nStep 2 — pick plan:");
form.fillStep2("Pro");
history.push(form.save());
form.print();

console.log("\nStep 3 — payment:");
form.fillStep3("Visa-4242");
history.push(form.save());
form.print();

console.log("\n--- User goes back twice ---");
history.pop(); // discard current (step 3)
const prev = history.pop(); // discard step 2 snapshot, load step 2
if (prev) {
  form.restore(prev);
  form.print();
}

console.log("\nUser changes plan to 'Enterprise':");
form.fillStep2("Enterprise");
form.print();
