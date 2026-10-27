/**
 * Prototype — creates new objects by copying (cloning) an existing object.
 *
 * Use case: A game where enemy archetypes are configured once, then stamped out
 * cheaply via clone rather than re-running expensive initialization each time.
 */

interface Cloneable<T> {
  clone(): T;
}

class Position {
  constructor(public x: number, public y: number) {}
  clone(): Position { return new Position(this.x, this.y); }
}

class Enemy implements Cloneable<Enemy> {
  private kills = 0;

  constructor(
    public name: string,
    public health: number,
    public damage: number,
    public position: Position,
    public abilities: string[],
  ) {}

  clone(): Enemy {
    // Deep-copy mutable fields so clones don't share references.
    return new Enemy(
      this.name,
      this.health,
      this.damage,
      this.position.clone(),
      [...this.abilities],
    );
  }

  spawnAt(x: number, y: number): Enemy {
    const copy = this.clone();
    copy.position.x = x;
    copy.position.y = y;
    return copy;
  }

  recordKill(): void { this.kills++; }

  toString(): string {
    return `${this.name} HP:${this.health} DMG:${this.damage} ` +
           `@ (${this.position.x},${this.position.y}) ` +
           `abilities:[${this.abilities.join(", ")}]`;
  }
}

// --- Prototype registry ---

class EnemyRegistry {
  private archetypes = new Map<string, Enemy>();

  register(key: string, archetype: Enemy): void {
    this.archetypes.set(key, archetype);
  }

  spawn(key: string, x: number, y: number): Enemy {
    const archetype = this.archetypes.get(key);
    if (!archetype) throw new Error(`Unknown archetype: ${key}`);
    return archetype.spawnAt(x, y);
  }
}

// --- Demo ---

const registry = new EnemyRegistry();

// Configure archetypes once.
registry.register("goblin",
  new Enemy("Goblin", 30, 5, new Position(0, 0), ["stealth"]));
registry.register("troll",
  new Enemy("Troll", 200, 20, new Position(0, 0), ["regenerate", "smash"]));

// Stamp out instances cheaply.
const enemies = [
  registry.spawn("goblin", 10, 5),
  registry.spawn("goblin", 15, 8),
  registry.spawn("troll",  50, 50),
];

console.log("Spawned enemies:");
enemies.forEach(e => console.log(" ", e.toString()));

// Mutating a clone doesn't affect the archetype.
const g1 = registry.spawn("goblin", 1, 1);
g1.abilities.push("poison");
const g2 = registry.spawn("goblin", 2, 2);
console.log("\ng1 abilities:", g1.abilities);
console.log("g2 abilities (unaffected):", g2.abilities);
