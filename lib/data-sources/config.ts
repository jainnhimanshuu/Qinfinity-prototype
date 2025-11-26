import { DataSourceConfig, DataSourceType } from "./interface";

/**
 * Service identifiers
 */
export type ServiceId = "h2r" | "lms" | "wfm" | "ticketing" | "performance";

/**
 * Default data source configurations for each service
 */
export const defaultDataSourceConfigs: Record<ServiceId, DataSourceConfig> = {
  h2r: {
    id: "h2r-datasource",
    name: "H2R HR Portal",
    type: "mock",
    baseUrl: process.env.H2R_API_URL || "http://localhost:3001/api/h2r",
    timeout: 30000,
    retryCount: 3,
    metadata: {
      description: "HR portal for employee services and HR-related tasks",
      version: "1.0.0",
    },
  },
  lms: {
    id: "lms-datasource",
    name: "Learning Management System",
    type: "mock",
    baseUrl: process.env.LMS_API_URL || "http://localhost:3002/api/lms",
    timeout: 30000,
    retryCount: 3,
    metadata: {
      description: "Learning Management System for training and courses",
      version: "1.0.0",
    },
  },
  wfm: {
    id: "wfm-datasource",
    name: "Workforce Management",
    type: "mock",
    baseUrl: process.env.WFM_API_URL || "http://localhost:3003/api/wfm",
    timeout: 30000,
    retryCount: 3,
    metadata: {
      description: "Workforce Management for scheduling and attendance",
      version: "1.0.0",
    },
  },
  ticketing: {
    id: "ticketing-datasource",
    name: "Ticketing System",
    type: "mock",
    baseUrl: process.env.TICKETING_API_URL || "http://localhost:3004/api/ticketing",
    timeout: 30000,
    retryCount: 3,
    metadata: {
      description: "Ticketing System for project management and IT support",
      version: "1.0.0",
    },
  },
  performance: {
    id: "performance-datasource",
    name: "Performance Management System",
    type: "mock",
    baseUrl: process.env.PERFORMANCE_API_URL || "http://localhost:3005/api/performance",
    timeout: 30000,
    retryCount: 3,
    metadata: {
      description: "Performance Management System for tracking and improving employee performance",
      version: "1.0.0",
    },
  },
};

/**
 * Get data source configuration for a service
 */
export function getDataSourceConfig(serviceId: ServiceId): DataSourceConfig {
  return defaultDataSourceConfigs[serviceId];
}

/**
 * Update data source configuration
 */
export function updateDataSourceConfig(
  serviceId: ServiceId,
  updates: Partial<DataSourceConfig>
): DataSourceConfig {
  const current = defaultDataSourceConfigs[serviceId];
  defaultDataSourceConfigs[serviceId] = {
    ...current,
    ...updates,
    metadata: {
      ...current.metadata,
      ...updates.metadata,
    },
  };
  return defaultDataSourceConfigs[serviceId];
}

/**
 * Set data source type for a service (useful for switching between mock and real APIs)
 */
export function setDataSourceType(serviceId: ServiceId, type: DataSourceType): void {
  defaultDataSourceConfigs[serviceId].type = type;
}

/**
 * Get all data source configurations
 */
export function getAllDataSourceConfigs(): Record<ServiceId, DataSourceConfig> {
  return { ...defaultDataSourceConfigs };
}

/**
 * Data mapping configuration for transforming external data
 */
export interface DataMappingConfig {
  sourceField: string;
  targetField: string;
  transform?: (value: unknown) => unknown;
}

/**
 * Service data mapping configurations
 */
export const serviceMappingConfigs: Record<ServiceId, DataMappingConfig[]> = {
  h2r: [
    { sourceField: "id", targetField: "id" },
    { sourceField: "employee_id", targetField: "employeeId" },
    { sourceField: "first_name", targetField: "firstName" },
    { sourceField: "last_name", targetField: "lastName" },
  ],
  lms: [
    { sourceField: "id", targetField: "id" },
    { sourceField: "course_title", targetField: "title" },
    { sourceField: "course_description", targetField: "description" },
  ],
  wfm: [
    { sourceField: "id", targetField: "id" },
    { sourceField: "shift_date", targetField: "date" },
    { sourceField: "shift_start", targetField: "startTime" },
    { sourceField: "shift_end", targetField: "endTime" },
  ],
  ticketing: [
    { sourceField: "id", targetField: "id" },
    { sourceField: "ticket_title", targetField: "title" },
    { sourceField: "ticket_status", targetField: "status" },
  ],
  performance: [
    { sourceField: "id", targetField: "id" },
    { sourceField: "kpi_name", targetField: "name" },
    { sourceField: "kpi_value", targetField: "actualValue" },
  ],
};

/**
 * Get mapping configuration for a service
 */
export function getMappingConfig(serviceId: ServiceId): DataMappingConfig[] {
  return serviceMappingConfigs[serviceId] || [];
}

