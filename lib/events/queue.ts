import { Event, QueueMessage } from "@/types/events";
import { getEventBus } from "./event-bus";

/**
 * Queue processing options
 */
interface QueueOptions {
  maxConcurrent: number;
  retryDelay: number;
  maxRetries: number;
  processingTimeout: number;
}

/**
 * Queue statistics
 */
interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetter: number;
}

/**
 * In-memory event queue for async processing
 */
export class EventQueue {
  private queue: QueueMessage[] = [];
  private processing: Set<string> = new Set();
  private deadLetter: QueueMessage[] = [];
  private completedCount: number = 0;
  private failedCount: number = 0;
  private isProcessing: boolean = false;
  private options: QueueOptions;

  constructor(options?: Partial<QueueOptions>) {
    this.options = {
      maxConcurrent: options?.maxConcurrent || 5,
      retryDelay: options?.retryDelay || 1000,
      maxRetries: options?.maxRetries || 3,
      processingTimeout: options?.processingTimeout || 30000,
    };
  }

  /**
   * Enqueue an event for processing
   */
  enqueue(event: Event, priority: number = 0, scheduledAt?: string): string {
    const message: QueueMessage = {
      id: this.generateId(),
      event,
      priority,
      retryCount: 0,
      maxRetries: this.options.maxRetries,
      scheduledAt,
      status: "pending",
    };

    // Insert in priority order (higher priority first)
    const insertIndex = this.queue.findIndex((m) => m.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(message);
    } else {
      this.queue.splice(insertIndex, 0, message);
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return message.id;
  }

  /**
   * Schedule an event for later processing
   */
  schedule(event: Event, delayMs: number, priority: number = 0): string {
    const scheduledAt = new Date(Date.now() + delayMs).toISOString();
    return this.enqueue(event, priority, scheduledAt);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      pending: this.queue.filter((m) => m.status === "pending").length,
      processing: this.processing.size,
      completed: this.completedCount,
      failed: this.failedCount,
      deadLetter: this.deadLetter.length,
    };
  }

  /**
   * Get pending messages
   */
  getPendingMessages(): QueueMessage[] {
    return this.queue.filter((m) => m.status === "pending");
  }

  /**
   * Get dead letter messages
   */
  getDeadLetterMessages(): QueueMessage[] {
    return [...this.deadLetter];
  }

  /**
   * Retry a dead letter message
   */
  retryDeadLetter(messageId: string): boolean {
    const index = this.deadLetter.findIndex((m) => m.id === messageId);
    if (index === -1) return false;

    const message = this.deadLetter.splice(index, 1)[0];
    message.status = "pending";
    message.retryCount = 0;
    this.queue.push(message);

    if (!this.isProcessing) {
      this.startProcessing();
    }

    return true;
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetter(): void {
    this.deadLetter = [];
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isProcessing = false;
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    this.processing.clear();
  }

  /**
   * Start processing the queue
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.isProcessing && this.queue.length > 0) {
      // Process up to maxConcurrent messages
      const availableSlots = this.options.maxConcurrent - this.processing.size;
      if (availableSlots <= 0) {
        await this.delay(100);
        continue;
      }

      const now = new Date().toISOString();
      const readyMessages = this.queue
        .filter(
          (m) =>
            m.status === "pending" &&
            !this.processing.has(m.id) &&
            (!m.scheduledAt || m.scheduledAt <= now)
        )
        .slice(0, availableSlots);

      if (readyMessages.length === 0) {
        await this.delay(100);
        continue;
      }

      // Process messages concurrently
      const processingPromises = readyMessages.map((message) =>
        this.processMessage(message)
      );

      await Promise.all(processingPromises);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single message
   */
  private async processMessage(message: QueueMessage): Promise<void> {
    this.processing.add(message.id);
    message.status = "processing";

    try {
      // Publish event through the event bus
      const eventBus = getEventBus();
      await Promise.race([
        eventBus.publish(message.event),
        this.timeout(this.options.processingTimeout),
      ]);

      // Mark as completed
      message.status = "completed";
      message.processedAt = new Date().toISOString();
      this.completedCount++;

      // Remove from queue
      this.removeFromQueue(message.id);
    } catch (error) {
      message.retryCount++;

      if (message.retryCount >= message.maxRetries) {
        // Move to dead letter queue
        message.status = "dead_letter";
        this.deadLetter.push(message);
        this.removeFromQueue(message.id);
        this.failedCount++;
      } else {
        // Schedule retry
        message.status = "pending";
        message.scheduledAt = new Date(
          Date.now() + this.options.retryDelay * Math.pow(2, message.retryCount)
        ).toISOString();
      }
    } finally {
      this.processing.delete(message.id);
    }
  }

  /**
   * Remove message from queue
   */
  private removeFromQueue(messageId: string): void {
    const index = this.queue.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Timeout promise
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Processing timeout")), ms)
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let eventQueueInstance: EventQueue | null = null;

export function getEventQueue(): EventQueue {
  if (!eventQueueInstance) {
    eventQueueInstance = new EventQueue();
  }
  return eventQueueInstance;
}

/**
 * Create a new event queue with custom options
 */
export function createEventQueue(options?: Partial<QueueOptions>): EventQueue {
  return new EventQueue(options);
}

