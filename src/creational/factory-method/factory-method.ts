/**
 * Factory Method — defines an interface for creating an object, but lets subclasses
 * decide which class to instantiate.
 *
 * Use case: A notification system where the channel (Email, SMS, Push) is chosen
 * at runtime without the sender knowing the concrete class.
 */

interface Notification {
  send(recipient: string, message: string): void;
}

class EmailNotification implements Notification {
  send(recipient: string, message: string): void {
    console.log(`[Email] To: ${recipient} | "${message}"`);
  }
}

class SmsNotification implements Notification {
  send(recipient: string, message: string): void {
    console.log(`[SMS]   To: ${recipient} | "${message}"`);
  }
}

class PushNotification implements Notification {
  send(recipient: string, message: string): void {
    console.log(`[Push]  To: ${recipient} | "${message}"`);
  }
}

// The creator declares the factory method.
abstract class NotificationSender {
  // Factory method — subclasses override this.
  abstract createNotification(): Notification;

  notify(recipient: string, message: string): void {
    const notification = this.createNotification();
    notification.send(recipient, message);
  }
}

class EmailSender extends NotificationSender {
  createNotification(): Notification {
    return new EmailNotification();
  }
}

class SmsSender extends NotificationSender {
  createNotification(): Notification {
    return new SmsNotification();
  }
}

class PushSender extends NotificationSender {
  createNotification(): Notification {
    return new PushNotification();
  }
}

// --- Demo ---

type Channel = "email" | "sms" | "push";

function getSender(channel: Channel): NotificationSender {
  switch (channel) {
    case "email": return new EmailSender();
    case "sms":   return new SmsSender();
    case "push":  return new PushSender();
  }
}

const channels: Channel[] = ["email", "sms", "push"];

for (const channel of channels) {
  getSender(channel).notify("alice@example.com", "Your order has shipped!");
}
