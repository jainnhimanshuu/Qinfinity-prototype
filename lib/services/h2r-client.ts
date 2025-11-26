import { Employee, HiringRequisition, ServiceResponse } from "@/types/services";
import { BaseServiceClient } from "./base-client";
import { getDataSourceConfig } from "@/lib/data-sources/config";
import { generateMockEmployees, generateMockHiringRequisitions } from "@/lib/data-sources/mock-providers";

/**
 * H2R (HR Portal) Service Client
 * Handles employee management and hiring requisitions
 */
export class H2REmployeeClient extends BaseServiceClient<Employee> {
  constructor() {
    super(getDataSourceConfig("h2r"), generateMockEmployees(20));
  }

  /**
   * Get employees by department
   */
  async getByDepartment(department: string): Promise<ServiceResponse<Employee[]>> {
    return this.getWhere({ department });
  }

  /**
   * Get employees by manager
   */
  async getByManager(managerId: string): Promise<ServiceResponse<Employee[]>> {
    return this.getWhere({ managerId });
  }

  /**
   * Get active employees
   */
  async getActiveEmployees(): Promise<ServiceResponse<Employee[]>> {
    return this.getWhere({ status: "active" });
  }

  /**
   * Update employee status
   */
  async updateStatus(id: string, status: Employee["status"]): Promise<ServiceResponse<Employee>> {
    return this.update(id, { status });
  }

  /**
   * Search employees by name or email
   */
  async search(query: string): Promise<ServiceResponse<Employee[]>> {
    const result = await this.getAll();
    const filtered = result.data.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(query.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(query.toLowerCase()) ||
        emp.email.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: filtered };
  }
}

/**
 * H2R Hiring Requisition Client
 */
export class H2RRequisitionClient extends BaseServiceClient<HiringRequisition> {
  constructor() {
    super(
      { ...getDataSourceConfig("h2r"), id: "h2r-requisitions" },
      generateMockHiringRequisitions(10)
    );
  }

  /**
   * Get requisitions by status
   */
  async getByStatus(status: HiringRequisition["status"]): Promise<ServiceResponse<HiringRequisition[]>> {
    return this.getWhere({ status });
  }

  /**
   * Get requisitions by department
   */
  async getByDepartment(department: string): Promise<ServiceResponse<HiringRequisition[]>> {
    return this.getWhere({ department });
  }

  /**
   * Get requisitions by requester
   */
  async getByRequester(requestedBy: string): Promise<ServiceResponse<HiringRequisition[]>> {
    return this.getWhere({ requestedBy });
  }

  /**
   * Update requisition status
   */
  async updateStatus(id: string, status: HiringRequisition["status"]): Promise<ServiceResponse<HiringRequisition>> {
    return this.update(id, { status });
  }

  /**
   * Add ticket to requisition
   */
  async addTicket(id: string, ticketId: string): Promise<ServiceResponse<HiringRequisition>> {
    const result = await this.getById(id);
    if (!result.success || !result.data) {
      return { success: false, error: "Requisition not found" };
    }

    const ticketIds = [...result.data.ticketIds, ticketId];
    return this.update(id, { ticketIds });
  }

  /**
   * Check if all tickets are closed
   */
  async areAllTicketsClosed(id: string, ticketClient: { getById: (id: string) => Promise<ServiceResponse<{ status: string }>> }): Promise<boolean> {
    const result = await this.getById(id);
    if (!result.success || !result.data) {
      return false;
    }

    for (const ticketId of result.data.ticketIds) {
      const ticketResult = await ticketClient.getById(ticketId);
      if (ticketResult.success && ticketResult.data && ticketResult.data.status !== "closed") {
        return false;
      }
    }

    return true;
  }

  /**
   * Complete requisition (mark as completed when all tickets are closed)
   */
  async complete(id: string): Promise<ServiceResponse<HiringRequisition>> {
    return this.update(id, { status: "completed" });
  }
}

// Singleton instances
let employeeClientInstance: H2REmployeeClient | null = null;
let requisitionClientInstance: H2RRequisitionClient | null = null;

export function getH2REmployeeClient(): H2REmployeeClient {
  if (!employeeClientInstance) {
    employeeClientInstance = new H2REmployeeClient();
  }
  return employeeClientInstance;
}

export function getH2RRequisitionClient(): H2RRequisitionClient {
  if (!requisitionClientInstance) {
    requisitionClientInstance = new H2RRequisitionClient();
  }
  return requisitionClientInstance;
}

