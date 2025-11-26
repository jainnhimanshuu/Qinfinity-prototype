import { Event, EventType, WebhookConfig } from "@/types/events";
import { getEventBus } from "./event-bus";

/**
 * Webhook delivery result
 */
interface WebhookDeliveryResult {
  webhookId: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  retryCount: number;
  deliveredAt: string;
}

/**
 * Webhook handler for delivering events to external systems
 */
export class WebhookHandler {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveryHistory: WebhookDeliveryResult[] = [];
  private maxHistorySize: number = 500;

  constructor() {
    // Subscribe to all events for webhook delivery
    this.setupEventSubscription();
  }

  /**
   * Register a webhook
   */
  registerWebhook(config: WebhookConfig): void {
    this.webhooks.set(config.id, config);
  }

  /**
   * Unregister a webhook
   */
  unregisterWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId);
  }

  /**
   * Get all registered webhooks
   */
  getWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhook by ID
   */
  getWebhook(webhookId: string): WebhookConfig | undefined {
    return this.webhooks.get(webhookId);
  }

  /**
   * Update webhook configuration
   */
  updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): void {
    const existing = this.webhooks.get(webhookId);
    if (existing) {
      this.webhooks.set(webhookId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    }
  }

  /**
   * Enable/disable webhook
   */
  setWebhookActive(webhookId: string, active: boolean): void {
    this.updateWebhook(webhookId, { active });
  }

  /**
   * Deliver event to a specific webhook
   */
  async deliverToWebhook(webhookId: string, event: Event): Promise<WebhookDeliveryResult> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      return {
        webhookId,
        success: false,
        error: "Webhook not found",
        retryCount: 0,
        deliveredAt: new Date().toISOString(),
      };
    }

    if (!webhook.active) {
      return {
        webhookId,
        success: false,
        error: "Webhook is inactive",
        retryCount: 0,
        deliveredAt: new Date().toISOString(),
      };
    }

    return this.attemptDelivery(webhook, event, 0);
  }

  /**
   * Get delivery history
   */
  getDeliveryHistory(filter?: { webhookId?: string; limit?: number }): WebhookDeliveryResult[] {
    let history = this.deliveryHistory;

    if (filter?.webhookId) {
      history = history.filter((h) => h.webhookId === filter.webhookId);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Setup event subscription for automatic webhook delivery
   */
  private setupEventSubscription(): void {
    const eventBus = getEventBus();

    // Subscribe to all event types
    eventBus.on(
      [
        "ticket.created",
        "ticket.closed",
        "lms.course.completed",
        "h2r.requisition.created",
        "h2r.requisition.completed",
        "performance.assessment.created",
        "performance.skill_gap.identified",
      ],
      async (event) => {
        await this.deliverToMatchingWebhooks(event);
      }
    );
  }

  /**
   * Deliver event to all matching webhooks
   */
  private async deliverToMatchingWebhooks(event: Event): Promise<void> {
    const matchingWebhooks = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.active && webhook.events.includes(event.type)
    );

    const deliveryPromises = matchingWebhooks.map((webhook) =>
      this.attemptDelivery(webhook, event, 0)
    );

    await Promise.all(deliveryPromises);
  }

  /**
   * Attempt to deliver event to webhook with retries
   */
  private async attemptDelivery(
    webhook: WebhookConfig,
    event: Event,
    retryCount: number
  ): Promise<WebhookDeliveryResult> {
    try {
      // In a real implementation, this would make an HTTP request
      // For mock purposes, we simulate the delivery
      const success = await this.simulateDelivery(webhook, event);

      const result: WebhookDeliveryResult = {
        webhookId: webhook.id,
        success,
        statusCode: success ? 200 : 500,
        retryCount,
        deliveredAt: new Date().toISOString(),
      };

      this.recordDelivery(result);

      if (!success && retryCount < webhook.retryCount) {
        // Retry with exponential backoff
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.attemptDelivery(webhook, event, retryCount + 1);
      }

      return result;
    } catch (error) {
      const result: WebhookDeliveryResult = {
        webhookId: webhook.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        retryCount,
        deliveredAt: new Date().toISOString(),
      };

      this.recordDelivery(result);

      if (retryCount < webhook.retryCount) {
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.attemptDelivery(webhook, event, retryCount + 1);
      }

      return result;
    }
  }

  /**
   * Simulate webhook delivery (mock implementation)
   */
  private async simulateDelivery(webhook: WebhookConfig, event: Event): Promise<boolean> {
    // Simulate network delay
    await this.delay(50 + Math.random() * 100);

    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  /**
   * Record delivery result in history
   */
  private recordDelivery(result: WebhookDeliveryResult): void {
    this.deliveryHistory.push(result);
    if (this.deliveryHistory.length > this.maxHistorySize) {
      this.deliveryHistory.shift();
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let webhookHandlerInstance: WebhookHandler | null = null;

export function getWebhookHandler(): WebhookHandler {
  if (!webhookHandlerInstance) {
    webhookHandlerInstance = new WebhookHandler();
  }
  return webhookHandlerInstance;
}

/**
 * Create a webhook configuration
 */
export function createWebhookConfig(
  url: string,
  events: EventType[],
  options?: {
    id?: string;
    secret?: string;
    retryCount?: number;
    timeout?: number;
  }
): WebhookConfig {
  const now = new Date().toISOString();
  return {
    id: options?.id || `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url,
    events,
    secret: options?.secret,
    active: true,
    retryCount: options?.retryCount || 3,
    timeout: options?.timeout || 5000,
    createdAt: now,
    updatedAt: now,
  };
}

