// Re-export all types
export * from "./services";
export * from "./events";

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// ID generator utility type
export type IdGenerator = () => string;

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Filter and sort types
export interface FilterParams {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: unknown;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

// Query params
export interface QueryParams {
  filters?: FilterParams[];
  sort?: SortParams[];
  pagination?: PaginationParams;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// Dashboard widget types
export interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "list" | "table" | "status";
  title: string;
  service: string;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: NavItem[];
  badge?: {
    value: number | string;
    variant: "default" | "primary" | "success" | "warning" | "danger";
  };
}

// Theme types
export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
}

// User session types
export interface UserSession {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  preferences: Record<string, unknown>;
}

