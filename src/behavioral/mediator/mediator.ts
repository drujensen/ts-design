/**
 * Mediator — defines an object that encapsulates how a set of objects interact.
 * Promotes loose coupling by keeping objects from referring to each other directly.
 *
 * Use case: A chat room where users communicate through a central hub rather than
 * holding direct references to every other user.
 */

interface ChatMediator {
  register(user: ChatUser): void;
  sendMessage(from: ChatUser, message: string, toRoom: string): void;
  sendDirectMessage(from: ChatUser, toName: string, message: string): void;
}

class ChatRoom implements ChatMediator {
  private users = new Map<string, ChatUser>();
  private rooms = new Map<string, Set<ChatUser>>();

  register(user: ChatUser): void {
    this.users.set(user.name, user);
  }

  joinRoom(user: ChatUser, room: string): void {
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room)!.add(user);
    console.log(`  [${room}] ${user.name} joined`);
  }

  sendMessage(from: ChatUser, message: string, toRoom: string): void {
    const members = this.rooms.get(toRoom);
    if (!members) { console.log(`  Room "${toRoom}" not found`); return; }
    for (const member of members) {
      if (member !== from) member.receive(`[${toRoom}] ${from.name}: ${message}`);
    }
  }

  sendDirectMessage(from: ChatUser, toName: string, message: string): void {
    const recipient = this.users.get(toName);
    if (!recipient) { console.log(`  User "${toName}" not found`); return; }
    recipient.receive(`[DM from ${from.name}]: ${message}`);
  }
}

// --- Colleague ---

class ChatUser {
  constructor(
    public readonly name: string,
    private mediator: ChatMediator,
  ) {
    mediator.register(this);
  }

  sendToRoom(message: string, room: string): void {
    console.log(`  ${this.name} → [${room}]: ${message}`);
    this.mediator.sendMessage(this, message, room);
  }

  sendDirect(toName: string, message: string): void {
    console.log(`  ${this.name} → DM ${toName}: ${message}`);
    this.mediator.sendDirectMessage(this, toName, message);
  }

  receive(message: string): void {
    console.log(`    ${this.name} received: "${message}"`);
  }
}

// --- Demo ---

const chatRoom = new ChatRoom();

const alice = new ChatUser("Alice", chatRoom);
const bob   = new ChatUser("Bob",   chatRoom);
const carol = new ChatUser("Carol", chatRoom);
const dave  = new ChatUser("Dave",  chatRoom);

chatRoom.joinRoom(alice, "general");
chatRoom.joinRoom(bob,   "general");
chatRoom.joinRoom(carol, "general");
chatRoom.joinRoom(bob,   "typescript");
chatRoom.joinRoom(dave,  "typescript");

console.log("\n--- Room messages ---");
alice.sendToRoom("Hello everyone!", "general");
bob.sendToRoom("Types are great!", "typescript");

console.log("\n--- Direct message ---");
alice.sendDirect("Dave", "Are you joining the TS channel?");
