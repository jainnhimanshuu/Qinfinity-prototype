import { z } from "zod";

// Event types enum
export const EventTypeSchema = z.enum([
  // H2R events
  "h2r.requisition.created",
  "h2r.requisition.approved",
  "h2r.requisition.completed",
  "h2r.employee.onboarded",
  
  // LMS events
  "lms.course.enrolled",
  "lms.course.started",
  "lms.course.completed",
  "lms.course.dropped",
  
  // WFM events
  "wfm.shift.scheduled",
  "wfm.shift.completed",
  "wfm.attendance.recorded",
  
  // Ticketing events
  "ticket.created",
  "ticket.assigned",
  "ticket.updated",
  "ticket.resolved",
  "ticket.closed",
  
  // Performance events
  "performance.assessment.created",
  "performance.kpi.updated",
  "performance.skill_gap.identified",
  "performance.review.scheduled",
]);
export type EventType = z.infer<typeof EventTypeSchema>;

// Base event schema
export const BaseEventSchema = z.object({
  id: z.string(),
  type: EventTypeSchema,
  timestamp: z.string().datetime(),
  source: z.string(),
  correlationId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type BaseEvent = z.infer<typeof BaseEventSchema>;

// Generic event with payload
export const EventSchema = BaseEventSchema.extend({
  payload: z.record(z.string(), z.unknown()),
});
export type Event = z.infer<typeof EventSchema>;

// Event handler type
export type EventHandler = (event: Event) => Promise<void>;

// Event subscription
export interface EventSubscription {
  id: string;
  eventType: EventType | EventType[];
  handler: EventHandler;
  filter?: (event: Event) => boolean;
}

// Event bus interface
export interface IEventBus {
  publish(event: Event): Promise<void>;
  subscribe(subscription: EventSubscription): string;
  unsubscribe(subscriptionId: string): void;
  getSubscriptions(): EventSubscription[];
}

// Webhook configuration
export const WebhookConfigSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  events: z.array(EventTypeSchema),
  secret: z.string().optional(),
  active: z.boolean().default(true),
  retryCount: z.number().default(3),
  timeout: z.number().default(5000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

// Queue message
export const QueueMessageSchema = z.object({
  id: z.string(),
  event: EventSchema,
  priority: z.number().default(0),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  scheduledAt: z.string().datetime().optional(),
  processedAt: z.string().datetime().optional(),
  status: z.enum(["pending", "processing", "completed", "failed", "dead_letter"]),
});
export type QueueMessage = z.infer<typeof QueueMessageSchema>;

// Event filter options
export interface EventFilterOptions {
  eventTypes?: EventType[];
  source?: string;
  startDate?: Date;
  endDate?: Date;
  correlationId?: string;
}

// Event history entry
export const EventHistoryEntrySchema = z.object({
  id: z.string(),
  event: EventSchema,
  processedBy: z.array(z.string()),
  processedAt: z.string().datetime(),
  success: z.boolean(),
  error: z.string().optional(),
});
export type EventHistoryEntry = z.infer<typeof EventHistoryEntrySchema>;

