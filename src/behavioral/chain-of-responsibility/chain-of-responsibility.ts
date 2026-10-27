/**
 * Chain of Responsibility — passes a request along a chain of handlers. Each
 * handler decides to process the request or pass it to the next handler.
 *
 * Use case: An HTTP middleware pipeline that handles authentication,
 * rate-limiting, and logging before reaching the actual request handler.
 */

interface HttpRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  userId?: string;
}

interface HttpResponse {
  status: number;
  body: string;
}

abstract class Middleware {
  private next: Middleware | null = null;

  setNext(middleware: Middleware): Middleware {
    this.next = middleware;
    return middleware; // allows chaining: a.setNext(b).setNext(c)
  }

  protected passToNext(req: HttpRequest): HttpResponse {
    if (this.next) return this.next.handle(req);
    return { status: 200, body: "OK" };
  }

  abstract handle(req: HttpRequest): HttpResponse;
}

// --- Concrete handlers ---

class AuthMiddleware extends Middleware {
  private validTokens = new Set(["token-alice", "token-bob"]);

  handle(req: HttpRequest): HttpResponse {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    if (!token || !this.validTokens.has(token)) {
      return { status: 401, body: "Unauthorized" };
    }
    req.userId = token.split("-")[1] ?? "unknown"; // extract username from token
    console.log(`  [Auth] Authenticated user: ${req.userId}`);
    return this.passToNext(req);
  }
}

class RateLimitMiddleware extends Middleware {
  private counts = new Map<string, number>();
  private readonly limit = 3;

  handle(req: HttpRequest): HttpResponse {
    const user = req.userId ?? "anonymous";
    const count = (this.counts.get(user) ?? 0) + 1;
    this.counts.set(user, count);

    if (count > this.limit) {
      return { status: 429, body: `Rate limit exceeded for ${user}` };
    }
    console.log(`  [RateLimit] ${user}: ${count}/${this.limit}`);
    return this.passToNext(req);
  }
}

class LoggingMiddleware extends Middleware {
  handle(req: HttpRequest): HttpResponse {
    const response = this.passToNext(req);
    console.log(`  [Log] ${req.method} ${req.path} → ${response.status}`);
    return response;
  }
}

class RequestHandler extends Middleware {
  handle(req: HttpRequest): HttpResponse {
    return { status: 200, body: `Hello, ${req.userId ?? "guest"}! Path: ${req.path}` };
  }
}

// --- Build the chain ---

const auth      = new AuthMiddleware();
const rateLimit = new RateLimitMiddleware();
const logging   = new LoggingMiddleware();
const handler   = new RequestHandler();

auth.setNext(rateLimit).setNext(logging).setNext(handler);

// --- Demo ---

const requests: HttpRequest[] = [
  { path: "/api/data", method: "GET", headers: { authorization: "Bearer token-alice" } },
  { path: "/api/data", method: "GET", headers: { authorization: "Bearer token-alice" } },
  { path: "/api/data", method: "GET", headers: { authorization: "Bearer token-alice" } },
  { path: "/api/data", method: "GET", headers: { authorization: "Bearer token-alice" } }, // rate limited
  { path: "/api/data", method: "GET", headers: {} },                                       // unauthorized
];

for (const [i, req] of requests.entries()) {
  console.log(`\nRequest ${i + 1}:`);
  const res = auth.handle(req);
  console.log(`  Response: ${res.status} — ${res.body}`);
}
