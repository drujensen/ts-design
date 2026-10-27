/**
 * Proxy — provides a surrogate or placeholder for another object to control
 * access to it.
 *
 * Three common flavors shown here:
 *  1. Virtual proxy  — defers expensive initialization until first use.
 *  2. Protection proxy — enforces access control.
 *  3. Caching proxy  — memoizes results of expensive operations.
 */

// ─── 1. Virtual Proxy (lazy initialization) ───────────────────────────────

interface ImageLoader {
  display(): void;
}

class RealImage implements ImageLoader {
  constructor(private filename: string) {
    console.log(`  [RealImage] Loading ${filename} from disk...`);
  }
  display(): void { console.log(`  [RealImage] Displaying ${this.filename}`); }
}

class LazyImageProxy implements ImageLoader {
  private realImage: RealImage | null = null;
  constructor(private filename: string) {}

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename); // only now
    }
    this.realImage.display();
  }
}

// ─── 2. Protection Proxy (access control) ─────────────────────────────────

interface Database {
  query(sql: string): string[];
  execute(sql: string): void;
}

type Role = "reader" | "admin";

class RealDatabase implements Database {
  query(sql: string): string[]  { return [`result of: ${sql}`]; }
  execute(sql: string): void    { console.log(`  [DB] Executed: ${sql}`); }
}

class ProtectedDatabaseProxy implements Database {
  constructor(
    private db: RealDatabase,
    private role: Role,
  ) {}

  query(sql: string): string[] {
    return this.db.query(sql);
  }

  execute(sql: string): void {
    if (this.role !== "admin") {
      throw new Error(`Access denied: role '${this.role}' cannot execute writes`);
    }
    this.db.execute(sql);
  }
}

// ─── 3. Caching Proxy (memoization) ───────────────────────────────────────

interface WeatherService {
  getForecast(city: string): string;
}

class LiveWeatherService implements WeatherService {
  getForecast(city: string): string {
    console.log(`  [Weather API] Fetching forecast for ${city}...`);
    return `Sunny, 22°C in ${city}`;
  }
}

class CachingWeatherProxy implements WeatherService {
  private cache = new Map<string, string>();
  constructor(private service: LiveWeatherService) {}

  getForecast(city: string): string {
    if (this.cache.has(city)) {
      console.log(`  [Cache] Hit for ${city}`);
      return this.cache.get(city)!;
    }
    const result = this.service.getForecast(city);
    this.cache.set(city, result);
    return result;
  }
}

// --- Demo ---

console.log("=== Virtual Proxy ===");
const img = new LazyImageProxy("hero.png");
console.log("Image created — no disk I/O yet");
img.display(); // loads now
img.display(); // no reload

console.log("\n=== Protection Proxy ===");
const db = new RealDatabase();
const readerProxy = new ProtectedDatabaseProxy(db, "reader");
console.log(readerProxy.query("SELECT * FROM users"));
try { readerProxy.execute("DROP TABLE users"); }
catch (e) { console.log(`  Caught: ${(e as Error).message}`); }

const adminProxy = new ProtectedDatabaseProxy(db, "admin");
adminProxy.execute("UPDATE users SET active=true");

console.log("\n=== Caching Proxy ===");
const weather = new CachingWeatherProxy(new LiveWeatherService());
console.log(weather.getForecast("London"));
console.log(weather.getForecast("London")); // cache hit
console.log(weather.getForecast("Paris"));
