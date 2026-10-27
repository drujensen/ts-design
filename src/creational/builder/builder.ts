/**
 * Builder — separates the construction of a complex object from its representation,
 * allowing the same construction process to create different representations.
 *
 * Use case: Building SQL-like queries step by step. The director can assemble
 * common query shapes; callers can also drive the builder directly for custom ones.
 */

interface Query {
  table: string;
  fields: string[];
  conditions: string[];
  orderBy: string | null;
  limit: number | null;
}

interface QueryBuilder {
  from(table: string): this;
  select(...fields: string[]): this;
  where(condition: string): this;
  orderBy(field: string): this;
  limit(n: number): this;
  build(): Query;
}

class SqlQueryBuilder implements QueryBuilder {
  private query: Query = {
    table: "",
    fields: [],
    conditions: [],
    orderBy: null,
    limit: null,
  };

  from(table: string): this {
    this.query.table = table;
    return this;
  }

  select(...fields: string[]): this {
    this.query.fields.push(...fields);
    return this;
  }

  where(condition: string): this {
    this.query.conditions.push(condition);
    return this;
  }

  orderBy(field: string): this {
    this.query.orderBy = field;
    return this;
  }

  limit(n: number): this {
    this.query.limit = n;
    return this;
  }

  build(): Query {
    if (!this.query.table) throw new Error("Table is required");
    return { ...this.query };
  }

  toSql(): string {
    const q = this.build();
    const fields = q.fields.length ? q.fields.join(", ") : "*";
    let sql = `SELECT ${fields} FROM ${q.table}`;
    if (q.conditions.length) sql += ` WHERE ${q.conditions.join(" AND ")}`;
    if (q.orderBy)           sql += ` ORDER BY ${q.orderBy}`;
    if (q.limit !== null)    sql += ` LIMIT ${q.limit}`;
    return sql;
  }
}

// Director encodes common query recipes using the builder interface.
class QueryDirector {
  constructor(private builder: SqlQueryBuilder) {}

  buildRecentActiveUsers(): string {
    return this.builder
      .from("users")
      .select("id", "name", "email")
      .where("active = true")
      .orderBy("created_at DESC")
      .limit(10)
      .toSql();
  }
}

// --- Demo ---

// Direct builder use — full control
const custom = new SqlQueryBuilder()
  .from("orders")
  .select("order_id", "total")
  .where("status = 'pending'")
  .where("total > 100")
  .toSql();

console.log("Custom query:");
console.log(" ", custom);

// Director-driven — reusable recipe
const director = new QueryDirector(new SqlQueryBuilder());
console.log("\nDirector-built query:");
console.log(" ", director.buildRecentActiveUsers());
