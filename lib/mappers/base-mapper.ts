import { DataMappingConfig } from "@/lib/data-sources/config";

/**
 * Base mapper interface for transforming data between formats
 */
export interface IMapper<TSource, TTarget> {
  /**
   * Transform a single source object to target format
   */
  toTarget(source: TSource): TTarget;

  /**
   * Transform a single target object back to source format
   */
  toSource(target: TTarget): TSource;

  /**
   * Transform an array of source objects to target format
   */
  toTargetArray(sources: TSource[]): TTarget[];

  /**
   * Transform an array of target objects back to source format
   */
  toSourceArray(targets: TTarget[]): TSource[];
}

/**
 * Generic field mapper that uses configuration to transform objects
 */
export class FieldMapper<TSource extends Record<string, unknown>, TTarget extends Record<string, unknown>>
  implements IMapper<TSource, TTarget>
{
  constructor(
    private mappings: DataMappingConfig[],
    private reverseMappings?: DataMappingConfig[]
  ) {
    // Generate reverse mappings if not provided
    if (!this.reverseMappings) {
      this.reverseMappings = mappings.map((m) => ({
        sourceField: m.targetField,
        targetField: m.sourceField,
        transform: undefined, // Reverse transforms need to be explicitly defined
      }));
    }
  }

  toTarget(source: TSource): TTarget {
    const result: Record<string, unknown> = {};

    for (const mapping of this.mappings) {
      const value = this.getNestedValue(source, mapping.sourceField);
      const transformedValue = mapping.transform ? mapping.transform(value) : value;
      this.setNestedValue(result, mapping.targetField, transformedValue);
    }

    return result as TTarget;
  }

  toSource(target: TTarget): TSource {
    const result: Record<string, unknown> = {};

    for (const mapping of this.reverseMappings!) {
      const value = this.getNestedValue(target, mapping.sourceField);
      const transformedValue = mapping.transform ? mapping.transform(value) : value;
      this.setNestedValue(result, mapping.targetField, transformedValue);
    }

    return result as TSource;
  }

  toTargetArray(sources: TSource[]): TTarget[] {
    return sources.map((source) => this.toTarget(source));
  }

  toSourceArray(targets: TTarget[]): TSource[] {
    return targets.map((target) => this.toSource(target));
  }

  /**
   * Get a nested value from an object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split(".");
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  /**
   * Set a nested value in an object using dot notation
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }
}

/**
 * Identity mapper that returns the same object (used when no transformation is needed)
 */
export class IdentityMapper<T> implements IMapper<T, T> {
  toTarget(source: T): T {
    return source;
  }

  toSource(target: T): T {
    return target;
  }

  toTargetArray(sources: T[]): T[] {
    return sources;
  }

  toSourceArray(targets: T[]): T[] {
    return targets;
  }
}

/**
 * Composite mapper that chains multiple mappers together
 */
export class CompositeMapper<TSource, TIntermediate, TTarget>
  implements IMapper<TSource, TTarget>
{
  constructor(
    private firstMapper: IMapper<TSource, TIntermediate>,
    private secondMapper: IMapper<TIntermediate, TTarget>
  ) {}

  toTarget(source: TSource): TTarget {
    const intermediate = this.firstMapper.toTarget(source);
    return this.secondMapper.toTarget(intermediate);
  }

  toSource(target: TTarget): TSource {
    const intermediate = this.secondMapper.toSource(target);
    return this.firstMapper.toSource(intermediate);
  }

  toTargetArray(sources: TSource[]): TTarget[] {
    return sources.map((source) => this.toTarget(source));
  }

  toSourceArray(targets: TTarget[]): TSource[] {
    return targets.map((target) => this.toSource(target));
  }
}

/**
 * Custom mapper that uses provided transformation functions
 */
export class CustomMapper<TSource, TTarget> implements IMapper<TSource, TTarget> {
  constructor(
    private toTargetFn: (source: TSource) => TTarget,
    private toSourceFn: (target: TTarget) => TSource
  ) {}

  toTarget(source: TSource): TTarget {
    return this.toTargetFn(source);
  }

  toSource(target: TTarget): TSource {
    return this.toSourceFn(target);
  }

  toTargetArray(sources: TSource[]): TTarget[] {
    return sources.map((source) => this.toTarget(source));
  }

  toSourceArray(targets: TTarget[]): TSource[] {
    return targets.map((target) => this.toSource(target));
  }
}

/**
 * Utility functions for common transformations
 */
export const transformUtils = {
  /**
   * Convert snake_case to camelCase
   */
  snakeToCamel: (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  /**
   * Convert camelCase to snake_case
   */
  camelToSnake: (str: string): string => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },

  /**
   * Parse ISO date string to Date object
   */
  parseDate: (value: unknown): Date | undefined => {
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  },

  /**
   * Format Date to ISO string
   */
  formatDate: (value: unknown): string | undefined => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return undefined;
  },

  /**
   * Convert string to number
   */
  toNumber: (value: unknown): number | undefined => {
    if (typeof value === "string") {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }
    if (typeof value === "number") {
      return value;
    }
    return undefined;
  },

  /**
   * Convert to boolean
   */
  toBoolean: (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    if (typeof value === "number") return value !== 0;
    return false;
  },

  /**
   * Ensure value is an array
   */
  toArray: <T>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (value === null || value === undefined) return [];
    return [value as T];
  },
};

