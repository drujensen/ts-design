/**
 * Facade — provides a simplified interface to a complex subsystem.
 *
 * Use case: An e-commerce checkout that coordinates inventory, payment,
 * shipping, and email subsystems behind a single `placeOrder()` call.
 */

// --- Complex subsystems ---

class InventoryService {
  checkStock(productId: string, qty: number): boolean {
    console.log(`  [Inventory] Checking ${qty}x ${productId}`);
    return true; // assume in stock
  }
  reserveStock(productId: string, qty: number): void {
    console.log(`  [Inventory] Reserved ${qty}x ${productId}`);
  }
  releaseStock(productId: string, qty: number): void {
    console.log(`  [Inventory] Released ${qty}x ${productId}`);
  }
}

class PaymentService {
  charge(customerId: string, amountCents: number): string | null {
    const txId = `PAY-${customerId}-${amountCents}`;
    console.log(`  [Payment] Charged ${customerId} $${(amountCents / 100).toFixed(2)} → ${txId}`);
    return txId;
  }
  refund(txId: string): void {
    console.log(`  [Payment] Refunded ${txId}`);
  }
}

class ShippingService {
  createShipment(orderId: string, address: string): string {
    const trackingId = `SHIP-${orderId}`;
    console.log(`  [Shipping] Shipment created for ${orderId} to ${address} → ${trackingId}`);
    return trackingId;
  }
}

class EmailService {
  sendOrderConfirmation(email: string, orderId: string, trackingId: string): void {
    console.log(`  [Email] Sent confirmation to ${email} | order=${orderId}, tracking=${trackingId}`);
  }
  sendFailureNotice(email: string): void {
    console.log(`  [Email] Sent failure notice to ${email}`);
  }
}

// --- Facade ---

interface OrderRequest {
  orderId: string;
  customerId: string;
  email: string;
  productId: string;
  qty: number;
  amountCents: number;
  shippingAddress: string;
}

class CheckoutFacade {
  private inventory = new InventoryService();
  private payment   = new PaymentService();
  private shipping  = new ShippingService();
  private email     = new EmailService();

  placeOrder(req: OrderRequest): boolean {
    console.log(`\nPlacing order ${req.orderId}...`);

    if (!this.inventory.checkStock(req.productId, req.qty)) {
      console.log("  Order failed: out of stock");
      this.email.sendFailureNotice(req.email);
      return false;
    }

    this.inventory.reserveStock(req.productId, req.qty);

    const txId = this.payment.charge(req.customerId, req.amountCents);
    if (!txId) {
      this.inventory.releaseStock(req.productId, req.qty);
      this.email.sendFailureNotice(req.email);
      return false;
    }

    const trackingId = this.shipping.createShipment(req.orderId, req.shippingAddress);
    this.email.sendOrderConfirmation(req.email, req.orderId, trackingId);

    console.log(`Order ${req.orderId} placed successfully ✓`);
    return true;
  }
}

// --- Demo ---

const checkout = new CheckoutFacade();

checkout.placeOrder({
  orderId: "ORD-001",
  customerId: "CUST-42",
  email: "alice@example.com",
  productId: "SKU-1234",
  qty: 2,
  amountCents: 5998,
  shippingAddress: "123 Main St, Springfield",
});
