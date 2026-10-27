/**
 * Iterator — provides a way to sequentially access elements of a collection
 * without exposing its underlying representation.
 *
 * Use case: A paginated API result set that fetches the next page lazily
 * as the caller iterates, hiding all pagination bookkeeping.
 *
 * Also shows TypeScript's built-in Iterator/Iterable protocol so the
 * collection works natively with `for...of`.
 */

interface User {
  id: number;
  name: string;
}

// Simulate a remote data source (in-memory for the demo)
const ALL_USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User-${i + 1}`,
}));

function fetchPage(page: number, pageSize: number): User[] {
  const start = page * pageSize;
  return ALL_USERS.slice(start, start + pageSize);
}

// --- Custom Iterator ---

class PaginatedIterator implements Iterator<User> {
  private buffer: User[] = [];
  private bufferIndex = 0;
  private page = 0;
  private exhausted = false;

  constructor(private readonly pageSize: number) {
    this.loadNextPage();
  }

  private loadNextPage(): void {
    const results = fetchPage(this.page++, this.pageSize);
    this.buffer = results;
    this.bufferIndex = 0;
    if (results.length < this.pageSize) this.exhausted = true;
  }

  next(): IteratorResult<User> {
    if (this.bufferIndex >= this.buffer.length) {
      if (this.exhausted) {
        return { value: undefined as unknown as User, done: true };
      }
      this.loadNextPage();
    }
    if (this.bufferIndex >= this.buffer.length) {
      return { value: undefined as unknown as User, done: true };
    }
    return { value: this.buffer[this.bufferIndex++]!, done: false };
  }
}

// --- Iterable collection (implements TypeScript's Iterable<T>) ---

class UserCollection implements Iterable<User> {
  constructor(private readonly pageSize = 5) {}

  [Symbol.iterator](): Iterator<User> {
    return new PaginatedIterator(this.pageSize);
  }
}

// --- Range iterator (generator-based for comparison) ---

function* range(start: number, end: number, step = 1): Generator<number> {
  for (let i = start; i < end; i += step) yield i;
}

// --- Demo ---

const users = new UserCollection(5);

console.log("First 12 users (via for...of):");
let count = 0;
for (const user of users) {
  if (++count > 12) break;
  console.log(`  ${user.id}. ${user.name}`);
}

console.log("\nAll users collected into array:");
const all = [...new UserCollection(10)];
console.log(`  Total: ${all.length}`);

console.log("\nRange generator (0..20, step 3):");
console.log(" ", [...range(0, 20, 3)].join(", "));
