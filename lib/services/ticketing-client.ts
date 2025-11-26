import { Ticket, TicketCategory, TicketPriority, ServiceResponse } from "@/types/services";
import { BaseServiceClient } from "./base-client";
import { getDataSourceConfig } from "@/lib/data-sources/config";
import { generateMockTickets } from "@/lib/data-sources/mock-providers";

/**
 * Ticketing Service Client
 * Handles ticket management for project management and IT support
 */
export class TicketingClient extends BaseServiceClient<Ticket> {
  constructor() {
    super(getDataSourceConfig("ticketing"), generateMockTickets(25));
  }

  /**
   * Get tickets by category
   */
  async getByCategory(category: TicketCategory): Promise<ServiceResponse<Ticket[]>> {
    return this.getWhere({ category });
  }

  /**
   * Get tickets by priority
   */
  async getByPriority(priority: TicketPriority): Promise<ServiceResponse<Ticket[]>> {
    return this.getWhere({ priority });
  }

  /**
   * Get tickets by status
   */
  async getByStatus(status: Ticket["status"]): Promise<ServiceResponse<Ticket[]>> {
    return this.getWhere({ status });
  }

  /**
   * Get tickets by assignee
   */
  async getByAssignee(assigneeId: string): Promise<ServiceResponse<Ticket[]>> {
    return this.getWhere({ assigneeId });
  }

  /**
   * Get tickets by reporter
   */
  async getByReporter(reporterId: string): Promise<ServiceResponse<Ticket[]>> {
    return this.getWhere({ reporterId });
  }

  /**
   * Get tickets by related entity
   */
  async getByRelatedEntity(entityType: string, entityId: string): Promise<ServiceResponse<Ticket[]>> {
    return this.getWhere({ relatedEntityType: entityType, relatedEntityId: entityId });
  }

  /**
   * Create a new ticket
   */
  async createTicket(
    title: string,
    description: string,
    category: TicketCategory,
    priority: TicketPriority,
    reporterId: string,
    options?: {
      assigneeId?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      dueDate?: string;
      tags?: string[];
    }
  ): Promise<ServiceResponse<Ticket>> {
    const ticket: Partial<Ticket> = {
      id: this.generateId(),
      title,
      description,
      category,
      priority,
      status: "open",
      reporterId,
      assigneeId: options?.assigneeId,
      relatedEntityType: options?.relatedEntityType,
      relatedEntityId: options?.relatedEntityId,
      dueDate: options?.dueDate,
      tags: options?.tags || [],
      comments: [],
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };
    return this.create(ticket);
  }

  /**
   * Assign ticket to user
   */
  async assignTicket(ticketId: string, assigneeId: string): Promise<ServiceResponse<Ticket>> {
    return this.update(ticketId, { assigneeId, status: "in_progress" });
  }

  /**
   * Update ticket status
   */
  async updateStatus(ticketId: string, status: Ticket["status"]): Promise<ServiceResponse<Ticket>> {
    const updates: Partial<Ticket> = { status };
    if (status === "resolved" || status === "closed") {
      updates.resolvedAt = this.getCurrentTimestamp();
    }
    return this.update(ticketId, updates);
  }

  /**
   * Add comment to ticket
   */
  async addComment(ticketId: string, authorId: string, content: string): Promise<ServiceResponse<Ticket>> {
    const result = await this.getById(ticketId);
    if (!result.success || !result.data) {
      return { success: false, error: "Ticket not found" };
    }

    const comment = {
      id: this.generateId(),
      authorId,
      content,
      createdAt: this.getCurrentTimestamp(),
    };

    const comments = [...result.data.comments, comment];
    return this.update(ticketId, { comments });
  }

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId: string): Promise<ServiceResponse<Ticket>> {
    return this.updateStatus(ticketId, "resolved");
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId: string): Promise<ServiceResponse<Ticket>> {
    return this.updateStatus(ticketId, "closed");
  }

  /**
   * Reopen ticket
   */
  async reopenTicket(ticketId: string): Promise<ServiceResponse<Ticket>> {
    return this.update(ticketId, { status: "open", resolvedAt: undefined });
  }

  /**
   * Get open tickets count
   */
  async getOpenTicketsCount(): Promise<number> {
    const result = await this.getByStatus("open");
    return result.success && result.data ? result.data.length : 0;
  }

  /**
   * Get overdue tickets
   */
  async getOverdueTickets(): Promise<ServiceResponse<Ticket[]>> {
    const now = new Date().toISOString();
    const result = await this.getAll();
    const overdue = result.data.filter(
      (ticket) =>
        ticket.dueDate &&
        ticket.dueDate < now &&
        ticket.status !== "resolved" &&
        ticket.status !== "closed"
    );
    return { success: true, data: overdue };
  }

  /**
   * Create procurement ticket for hiring requisition
   */
  async createProcurementTicket(
    requisitionId: string,
    reporterId: string,
    details: string
  ): Promise<ServiceResponse<Ticket>> {
    return this.createTicket(
      "Procurement - Equipment Setup",
      `Procurement request for hiring requisition: ${details}`,
      "procurement",
      "high",
      reporterId,
      {
        relatedEntityType: "hiring_requisition",
        relatedEntityId: requisitionId,
        tags: ["onboarding", "procurement"],
      }
    );
  }

  /**
   * Create facilities ticket for hiring requisition
   */
  async createFacilitiesTicket(
    requisitionId: string,
    reporterId: string,
    details: string
  ): Promise<ServiceResponse<Ticket>> {
    return this.createTicket(
      "Facilities - Workspace Setup",
      `Facilities request for hiring requisition: ${details}`,
      "facilities",
      "high",
      reporterId,
      {
        relatedEntityType: "hiring_requisition",
        relatedEntityId: requisitionId,
        tags: ["onboarding", "facilities"],
      }
    );
  }

  /**
   * Create training ticket
   */
  async createTrainingTicket(
    employeeId: string,
    courseId: string,
    reporterId: string,
    details: string
  ): Promise<ServiceResponse<Ticket>> {
    return this.createTicket(
      "Training Assignment",
      `Training assignment: ${details}`,
      "training",
      "medium",
      reporterId,
      {
        assigneeId: employeeId,
        relatedEntityType: "course_enrollment",
        relatedEntityId: courseId,
        tags: ["training", "skill-development"],
      }
    );
  }
}

// Singleton instance
let ticketingClientInstance: TicketingClient | null = null;

export function getTicketingClient(): TicketingClient {
  if (!ticketingClientInstance) {
    ticketingClientInstance = new TicketingClient();
  }
  return ticketingClientInstance;
}

