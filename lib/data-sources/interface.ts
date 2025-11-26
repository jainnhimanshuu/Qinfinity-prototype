import { QueryParams, PaginatedResponse, ServiceResponse } from "@/types";

/**
 * Data source types supported by the system
 */
export type DataSourceType = "rest" | "graphql" | "mock" | "database";

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retryCount?: number;
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * Connection status for a data source
 */
export interface DataSourceStatus {
  connected: boolean;
  lastChecked: Date;
  latency?: number;
  error?: string;
}

/**
 * Generic data source interface that all implementations must follow
 */
export interface IDataSource<T> {
  readonly config: DataSourceConfig;
  
  /**
   * Initialize the data source connection
   */
  connect(): Promise<void>;
  
  /**
   * Close the data source connection
   */
  disconnect(): Promise<void>;
  
  /**
   * Check if the data source is healthy
   */
  healthCheck(): Promise<DataSourceStatus>;
  
  /**
   * Fetch all records with optional query parameters
   */
  findAll(params?: QueryParams): Promise<PaginatedResponse<T>>;
  
  /**
   * Fetch a single record by ID
   */
  findById(id: string): Promise<ServiceResponse<T>>;
  
  /**
   * Fetch records matching a filter
   */
  findWhere(filter: Record<string, unknown>): Promise<ServiceResponse<T[]>>;
  
  /**
   * Create a new record
   */
  create(data: Partial<T>): Promise<ServiceResponse<T>>;
  
  /**
   * Update an existing record
   */
  update(id: string, data: Partial<T>): Promise<ServiceResponse<T>>;
  
  /**
   * Delete a record
   */
  delete(id: string): Promise<ServiceResponse<void>>;
  
  /**
   * Execute a custom query/operation
   */
  execute<R>(operation: string, params?: Record<string, unknown>): Promise<ServiceResponse<R>>;
}

/**
 * Data source factory interface for creating data source instances
 */
export interface IDataSourceFactory {
  create<T>(config: DataSourceConfig): IDataSource<T>;
  register(type: DataSourceType, creator: DataSourceCreator): void;
}

/**
 * Data source creator function type
 */
export type DataSourceCreator = <T>(config: DataSourceConfig) => IDataSource<T>;

/**
 * Base abstract class for data sources with common functionality
 */
export abstract class BaseDataSource<T> implements IDataSource<T> {
  constructor(public readonly config: DataSourceConfig) {}
  
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract healthCheck(): Promise<DataSourceStatus>;
  abstract findAll(params?: QueryParams): Promise<PaginatedResponse<T>>;
  abstract findById(id: string): Promise<ServiceResponse<T>>;
  abstract findWhere(filter: Record<string, unknown>): Promise<ServiceResponse<T[]>>;
  abstract create(data: Partial<T>): Promise<ServiceResponse<T>>;
  abstract update(id: string, data: Partial<T>): Promise<ServiceResponse<T>>;
  abstract delete(id: string): Promise<ServiceResponse<void>>;
  abstract execute<R>(operation: string, params?: Record<string, unknown>): Promise<ServiceResponse<R>>;
  
  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get current timestamp in ISO format
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
  
  /**
   * Apply pagination to an array of items
   */
  protected paginate<I>(items: I[], page: number = 1, pageSize: number = 10): PaginatedResponse<I> {
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      data: items.slice(start, end),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }
  
  /**
   * Create a success response
   */
  protected success<R>(data: R): ServiceResponse<R> {
    return { success: true, data };
  }
  
  /**
   * Create an error response
   */
  protected error<R>(message: string): ServiceResponse<R> {
    return { success: false, error: message };
  }
}

