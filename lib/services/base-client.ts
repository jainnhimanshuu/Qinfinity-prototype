import { ServiceResponse, QueryParams, PaginatedResponse } from "@/types";
import { DataSourceConfig, IDataSource, MockDataSource } from "@/lib/data-sources";
import { IMapper, IdentityMapper } from "@/lib/mappers";

/**
 * Base service client interface
 */
export interface IServiceClient<T> {
  /**
   * Get all entities with optional filtering, sorting, and pagination
   */
  getAll(params?: QueryParams): Promise<PaginatedResponse<T>>;

  /**
   * Get a single entity by ID
   */
  getById(id: string): Promise<ServiceResponse<T>>;

  /**
   * Get entities matching a filter
   */
  getWhere(filter: Record<string, unknown>): Promise<ServiceResponse<T[]>>;

  /**
   * Create a new entity
   */
  create(data: Partial<T>): Promise<ServiceResponse<T>>;

  /**
   * Update an existing entity
   */
  update(id: string, data: Partial<T>): Promise<ServiceResponse<T>>;

  /**
   * Delete an entity
   */
  delete(id: string): Promise<ServiceResponse<void>>;

  /**
   * Execute a custom operation
   */
  execute<R>(operation: string, params?: Record<string, unknown>): Promise<ServiceResponse<R>>;
}

/**
 * Base service client implementation
 * Provides common functionality for all service clients
 */
export abstract class BaseServiceClient<T extends { id: string }> implements IServiceClient<T> {
  protected dataSource: IDataSource<T>;
  protected mapper: IMapper<T, T>;

  constructor(
    protected config: DataSourceConfig,
    initialData: T[] = [],
    mapper?: IMapper<T, T>
  ) {
    this.dataSource = new MockDataSource<T>(config, initialData);
    this.mapper = mapper || new IdentityMapper<T>();
  }

  async initialize(): Promise<void> {
    await this.dataSource.connect();
  }

  async dispose(): Promise<void> {
    await this.dataSource.disconnect();
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    const status = await this.dataSource.healthCheck();
    return {
      healthy: status.connected,
      latency: status.latency,
    };
  }

  async getAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const result = await this.dataSource.findAll(params);
    return {
      ...result,
      data: this.mapper.toTargetArray(result.data),
    };
  }

  async getById(id: string): Promise<ServiceResponse<T>> {
    const result = await this.dataSource.findById(id);
    if (result.success && result.data) {
      return {
        ...result,
        data: this.mapper.toTarget(result.data),
      };
    }
    return result;
  }

  async getWhere(filter: Record<string, unknown>): Promise<ServiceResponse<T[]>> {
    const result = await this.dataSource.findWhere(filter);
    if (result.success && result.data) {
      return {
        ...result,
        data: this.mapper.toTargetArray(result.data),
      };
    }
    return result;
  }

  async create(data: Partial<T>): Promise<ServiceResponse<T>> {
    const result = await this.dataSource.create(data);
    if (result.success && result.data) {
      return {
        ...result,
        data: this.mapper.toTarget(result.data),
      };
    }
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<ServiceResponse<T>> {
    const result = await this.dataSource.update(id, data);
    if (result.success && result.data) {
      return {
        ...result,
        data: this.mapper.toTarget(result.data),
      };
    }
    return result;
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    return this.dataSource.delete(id);
  }

  async execute<R>(operation: string, params?: Record<string, unknown>): Promise<ServiceResponse<R>> {
    return this.dataSource.execute<R>(operation, params);
  }

  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current timestamp
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
}

/**
 * Service client factory
 */
export class ServiceClientFactory {
  private static clients: Map<string, IServiceClient<unknown>> = new Map();

  static register<T>(name: string, client: IServiceClient<T>): void {
    this.clients.set(name, client as IServiceClient<unknown>);
  }

  static get<T>(name: string): IServiceClient<T> | undefined {
    return this.clients.get(name) as IServiceClient<T> | undefined;
  }

  static has(name: string): boolean {
    return this.clients.has(name);
  }

  static getAll(): Map<string, IServiceClient<unknown>> {
    return new Map(this.clients);
  }
}

