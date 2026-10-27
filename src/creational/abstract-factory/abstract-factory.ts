/**
 * Abstract Factory — provides an interface for creating families of related objects
 * without specifying their concrete classes.
 *
 * Use case: UI component toolkit that must produce consistent "Light" or "Dark"
 * themed buttons and checkboxes together. Swapping themes swaps the whole family.
 */

// --- Product interfaces ---

interface Button {
  render(): string;
  onClick(): void;
}

interface Checkbox {
  render(): string;
  toggle(): void;
}

// --- Light theme ---

class LightButton implements Button {
  render(): string { return "<button style='background:white; color:black'>Click</button>"; }
  onClick(): void  { console.log("[Light] Button clicked"); }
}

class LightCheckbox implements Checkbox {
  private checked = false;
  render(): string  { return `<input type='checkbox' ${this.checked ? "checked" : ""} />`; }
  toggle(): void    { this.checked = !this.checked; console.log(`[Light] Checkbox: ${this.checked}`); }
}

// --- Dark theme ---

class DarkButton implements Button {
  render(): string { return "<button style='background:#333; color:white'>Click</button>"; }
  onClick(): void  { console.log("[Dark] Button clicked"); }
}

class DarkCheckbox implements Checkbox {
  private checked = false;
  render(): string  { return `<input type='checkbox' class='dark' ${this.checked ? "checked" : ""} />`; }
  toggle(): void    { this.checked = !this.checked; console.log(`[Dark] Checkbox: ${this.checked}`); }
}

// --- Abstract Factory ---

interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class LightThemeFactory implements UIFactory {
  createButton():   Button   { return new LightButton(); }
  createCheckbox(): Checkbox { return new LightCheckbox(); }
}

class DarkThemeFactory implements UIFactory {
  createButton():   Button   { return new DarkButton(); }
  createCheckbox(): Checkbox { return new DarkCheckbox(); }
}

// --- Client code — depends only on UIFactory, not concrete classes ---

function buildLoginForm(factory: UIFactory): void {
  const button   = factory.createButton();
  const checkbox = factory.createCheckbox();

  console.log(button.render());
  console.log(checkbox.render());
  button.onClick();
  checkbox.toggle();
}

// --- Demo ---

console.log("=== Light Theme ===");
buildLoginForm(new LightThemeFactory());

console.log("\n=== Dark Theme ===");
buildLoginForm(new DarkThemeFactory());
