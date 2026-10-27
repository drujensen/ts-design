/**
 * Adapter — converts the interface of a class into another interface clients expect.
 * Lets classes work together that couldn't otherwise because of incompatible interfaces.
 *
 * Use case: New code expects a `PaymentProcessor` interface, but the only available
 * third-party library exposes a completely different `LegacyPaymentGateway` API.
 */

// --- Target interface — what our new code expects ---

interface PaymentProcessor {
  processPayment(amountCents: number, currency: string): Promise<string>;
  refund(transactionId: string): Promise<boolean>;
}

// --- Adaptee — the legacy third-party library we cannot modify ---

class LegacyPaymentGateway {
  charge(amountInDollars: number, currencyCode: string, metadata: object): string {
    const txId = `TXN-${Date.now()}`;
    console.log(`[Legacy] Charged $${amountInDollars} ${currencyCode}`, metadata);
    return txId;
  }

  reverseCharge(txId: string, reason: string): number {
    console.log(`[Legacy] Reversed ${txId} (${reason})`);
    return 0; // 0 = success error code
  }
}

// --- Adapter — wraps the legacy gateway to satisfy PaymentProcessor ---

class LegacyGatewayAdapter implements PaymentProcessor {
  constructor(private readonly gateway: LegacyPaymentGateway) {}

  async processPayment(amountCents: number, currency: string): Promise<string> {
    const dollars = amountCents / 100;
    const txId = this.gateway.charge(dollars, currency, { source: "adapter" });
    return txId;
  }

  async refund(transactionId: string): Promise<boolean> {
    const code = this.gateway.reverseCharge(transactionId, "customer-request");
    return code === 0;
  }
}

// --- Client code — works against the target interface only ---

async function checkout(processor: PaymentProcessor): Promise<void> {
  const txId = await processor.processPayment(4999, "USD");
  console.log("Transaction ID:", txId);

  const refunded = await processor.refund(txId);
  console.log("Refund success:", refunded);
}

// --- Demo ---

void (async () => {
  const legacyGateway = new LegacyPaymentGateway();
  const adapter = new LegacyGatewayAdapter(legacyGateway);

  // The client never touches LegacyPaymentGateway directly.
  await checkout(adapter);
})();
