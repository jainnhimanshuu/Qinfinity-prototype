import { Event, EventType, EventSubscription, IEventBus, EventHandler } from "@/types/events";

/**
 * In-memory event bus implementation
 * Provides pub/sub functionality for inter-service communication
 */
export class EventBus implements IEventBus {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize: number = 1000;

  /**
   * Publish an event to all subscribers
   */
  async publish(event: Event): Promise<void> {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Find matching subscriptions
    const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => this.matchesEventType(event.type, sub.eventType) && this.passesFilter(event, sub.filter)
    );

    // Execute handlers
    const promises = matchingSubscriptions.map(async (sub) => {
      try {
        await sub.handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Subscribe to events
   */
  subscribe(subscription: EventSubscription): string {
    const id = subscription.id || this.generateId();
    this.subscriptions.set(id, { ...subscription, id });
    return id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get event history
   */
  getHistory(filter?: { eventType?: EventType; limit?: number }): Event[] {
    let events = this.eventHistory;

    if (filter?.eventType) {
      events = events.filter((e) => e.type === filter.eventType);
    }

    if (filter?.limit) {
      events = events.slice(-filter.limit);
    }

    return events;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Create a typed event
   */
  createEvent(type: EventType, payload: Record<string, unknown>, source: string): Event {
    return {
      id: this.generateId(),
      type,
      payload,
      source,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Subscribe to a specific event type with a handler
   */
  on(eventType: EventType | EventType[], handler: EventHandler): string {
    return this.subscribe({
      id: this.generateId(),
      eventType,
      handler,
    });
  }

  /**
   * Subscribe to an event type once (auto-unsubscribe after first event)
   */
  once(eventType: EventType, handler: EventHandler): string {
    const id = this.generateId();
    const wrappedHandler: EventHandler = async (event) => {
      this.unsubscribe(id);
      await handler(event);
    };

    return this.subscribe({
      id,
      eventType,
      handler: wrappedHandler,
    });
  }

  /**
   * Emit an event (alias for publish with automatic event creation)
   */
  async emit(type: EventType, payload: Record<string, unknown>, source: string = "system"): Promise<void> {
    const event = this.createEvent(type, payload, source);
    await this.publish(event);
  }

  private matchesEventType(eventType: EventType, subscriptionType: EventType | EventType[]): boolean {
    if (Array.isArray(subscriptionType)) {
      return subscriptionType.includes(eventType);
    }
    return eventType === subscriptionType;
  }

  private passesFilter(event: Event, filter?: (event: Event) => boolean): boolean {
    if (!filter) return true;
    return filter(event);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
}

/**
 * Helper functions for common event patterns
 */
export const eventHelpers = {

  /**
   * Create a ticket created event
   */
  ticketCreated: (ticketId: string, category: string, relatedEntityId?: string) => ({
    type: "ticket.created" as EventType,
    payload: { ticketId, category, relatedEntityId },
  }),

  /**
   * Create a ticket closed event
   */
  ticketClosed: (ticketId: string, relatedEntityId?: string) => ({
    type: "ticket.closed" as EventType,
    payload: { ticketId, relatedEntityId },
  }),

  /**
   * Create a course completed event
   */
  courseCompleted: (enrollmentId: string, employeeId: string, courseId: string, score?: number) => ({
    type: "lms.course.completed" as EventType,
    payload: { enrollmentId, employeeId, courseId, score },
  }),

  /**
   * Create a skill gap identified event
   */
  skillGapIdentified: (employeeId: string, skillGapId: string, skillName: string) => ({
    type: "performance.skill_gap.identified" as EventType,
    payload: { employeeId, skillGapId, skillName },
  }),

  /**
   * Create a requisition created event
   */
  requisitionCreated: (requisitionId: string, department: string, requestedBy: string) => ({
    type: "h2r.requisition.created" as EventType,
    payload: { requisitionId, department, requestedBy },
  }),

  /**
   * Create an assessment created event
   */
  assessmentCreated: (assessmentId: string, employeeId: string, score: number) => ({
    type: "performance.assessment.created" as EventType,
    payload: { assessmentId, employeeId, score },
  }),
};

