import { QueryParams, PaginatedResponse, ServiceResponse, FilterParams } from "@/types";
import { BaseDataSource, DataSourceConfig, DataSourceStatus } from "./interface";

/**
 * Generic mock data source implementation
 * Stores data in memory and provides CRUD operations
 */
export class MockDataSource<T extends { id: string }> extends BaseDataSource<T> {
  private data: Map<string, T> = new Map();
  private connected: boolean = false;

  constructor(config: DataSourceConfig, initialData: T[] = []) {
    super(config);
    initialData.forEach((item) => this.data.set(item.id, item));
  }

  async connect(): Promise<void> {
    // Simulate connection delay
    await this.delay(100);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.delay(50);
    this.connected = false;
  }

  async healthCheck(): Promise<DataSourceStatus> {
    return {
      connected: this.connected,
      lastChecked: new Date(),
      latency: Math.random() * 50 + 10,
    };
  }

  async findAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    await this.delay(50);
    
    let items = Array.from(this.data.values());

    // Apply filters
    if (params?.filters) {
      items = this.applyFilters(items, params.filters);
    }

    // Apply sorting
    if (params?.sort && params.sort.length > 0) {
      items = this.applySort(items, params.sort);
    }

    // Apply pagination
    const page = params?.pagination?.page || 1;
    const pageSize = params?.pagination?.pageSize || 10;

    return this.paginate(items, page, pageSize);
  }

  async findById(id: string): Promise<ServiceResponse<T>> {
    await this.delay(30);
    
    const item = this.data.get(id);
    if (!item) {
      return this.error(`Item with id ${id} not found`);
    }
    return this.success(item);
  }

  async findWhere(filter: Record<string, unknown>): Promise<ServiceResponse<T[]>> {
    await this.delay(40);
    
    const items = Array.from(this.data.values()).filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        const itemValue = (item as Record<string, unknown>)[key];
        return itemValue === value;
      });
    });

    return this.success(items);
  }

  async create(data: Partial<T>): Promise<ServiceResponse<T>> {
    await this.delay(50);
    
    const id = (data as { id?: string }).id || this.generateId();
    const timestamp = this.getCurrentTimestamp();
    
    const newItem = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as T;

    this.data.set(id, newItem);
    return this.success(newItem);
  }

  async update(id: string, data: Partial<T>): Promise<ServiceResponse<T>> {
    await this.delay(40);
    
    const existing = this.data.get(id);
    if (!existing) {
      return this.error(`Item with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...data,
      id, // Ensure ID cannot be changed
      updatedAt: this.getCurrentTimestamp(),
    } as T;

    this.data.set(id, updated);
    return this.success(updated);
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    await this.delay(30);
    
    if (!this.data.has(id)) {
      return this.error(`Item with id ${id} not found`);
    }

    this.data.delete(id);
    return this.success(undefined);
  }

  async execute<R>(operation: string, params?: Record<string, unknown>): Promise<ServiceResponse<R>> {
    await this.delay(50);
    
    // Handle custom operations
    switch (operation) {
      case "count":
        return this.success(this.data.size as unknown as R);
      
      case "clear":
        this.data.clear();
        return this.success(undefined as unknown as R);
      
      case "bulkCreate":
        if (Array.isArray(params?.items)) {
          const items = params.items as Partial<T>[];
          const created: T[] = [];
          for (const item of items) {
            const result = await this.create(item);
            if (result.success && result.data) {
              created.push(result.data);
            }
          }
          return this.success(created as unknown as R);
        }
        return this.error("Invalid items for bulk create");
      
      case "bulkUpdate":
        if (Array.isArray(params?.updates)) {
          const updates = params.updates as Array<{ id: string; data: Partial<T> }>;
          const updated: T[] = [];
          for (const { id, data } of updates) {
            const result = await this.update(id, data);
            if (result.success && result.data) {
              updated.push(result.data);
            }
          }
          return this.success(updated as unknown as R);
        }
        return this.error("Invalid updates for bulk update");
      
      default:
        return this.error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Get all data (for debugging/testing)
   */
  getAllData(): T[] {
    return Array.from(this.data.values());
  }

  /**
   * Set data directly (for testing)
   */
  setData(items: T[]): void {
    this.data.clear();
    items.forEach((item) => this.data.set(item.id, item));
  }

  /**
   * Simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Apply filters to items
   */
  private applyFilters(items: T[], filters: FilterParams[]): T[] {
    return items.filter((item) => {
      return filters.every((filter) => {
        const value = (item as Record<string, unknown>)[filter.field];
        
        switch (filter.operator) {
          case "eq":
            return value === filter.value;
          case "ne":
            return value !== filter.value;
          case "gt":
            return typeof value === "number" && value > (filter.value as number);
          case "gte":
            return typeof value === "number" && value >= (filter.value as number);
          case "lt":
            return typeof value === "number" && value < (filter.value as number);
          case "lte":
            return typeof value === "number" && value <= (filter.value as number);
          case "in":
            return Array.isArray(filter.value) && filter.value.includes(value);
          case "contains":
            return typeof value === "string" && value.includes(filter.value as string);
          default:
            return true;
        }
      });
    });
  }

  /**
   * Apply sorting to items
   */
  private applySort(items: T[], sort: Array<{ field: string; direction: "asc" | "desc" }>): T[] {
    return [...items].sort((a, b) => {
      for (const { field, direction } of sort) {
        const aValue = (a as Record<string, unknown>)[field];
        const bValue = (b as Record<string, unknown>)[field];
        
        if (aValue === bValue) continue;
        
        const comparison = String(aValue) < String(bValue) ? -1 : 1;
        return direction === "asc" ? comparison : -comparison;
      }
      return 0;
    });
  }
}

