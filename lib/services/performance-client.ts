import {
  KPI,
  PerformanceMetric,
  QualityAssessment,
  SkillGap,
  ServiceResponse,
} from "@/types/services";
import { BaseServiceClient } from "./base-client";
import { getDataSourceConfig } from "@/lib/data-sources/config";
import {
  generateMockKPIs,
  generateMockPerformanceMetrics,
  generateMockQualityAssessments,
  generateMockSkillGaps,
} from "@/lib/data-sources/mock-providers";

/**
 * KPI Client
 */
export class KPIClient extends BaseServiceClient<KPI> {
  constructor() {
    super(
      { ...getDataSourceConfig("performance"), id: "performance-kpis" },
      generateMockKPIs(10)
    );
  }

  /**
   * Get KPIs by category
   */
  async getByCategory(category: string): Promise<ServiceResponse<KPI[]>> {
    return this.getWhere({ category });
  }
}

/**
 * Performance Metric Client
 */
export class PerformanceMetricClient extends BaseServiceClient<PerformanceMetric> {
  constructor() {
    super(
      { ...getDataSourceConfig("performance"), id: "performance-metrics" },
      generateMockPerformanceMetrics(40)
    );
  }

  /**
   * Get metrics by employee
   */
  async getByEmployee(employeeId: string): Promise<ServiceResponse<PerformanceMetric[]>> {
    return this.getWhere({ employeeId });
  }

  /**
   * Get metrics by KPI
   */
  async getByKPI(kpiId: string): Promise<ServiceResponse<PerformanceMetric[]>> {
    return this.getWhere({ kpiId });
  }

  /**
   * Get metrics by period
   */
  async getByPeriod(period: string): Promise<ServiceResponse<PerformanceMetric[]>> {
    return this.getWhere({ period });
  }

  /**
   * Get employee metrics for a period
   */
  async getEmployeeMetricsForPeriod(
    employeeId: string,
    period: string
  ): Promise<ServiceResponse<PerformanceMetric[]>> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const filtered = result.data.filter((m) => m.period === period);
    return { success: true, data: filtered };
  }

  /**
   * Calculate overall score for employee
   */
  async calculateOverallScore(employeeId: string, period: string): Promise<number> {
    const result = await this.getEmployeeMetricsForPeriod(employeeId, period);
    if (!result.success || !result.data || result.data.length === 0) {
      return 0;
    }
    const totalScore = result.data.reduce((sum, m) => sum + m.score, 0);
    return totalScore / result.data.length;
  }

  /**
   * Check if employee meets KPI thresholds
   */
  async meetsKPIThresholds(
    employeeId: string,
    period: string,
    threshold: number = 70
  ): Promise<{ meets: boolean; belowThreshold: PerformanceMetric[] }> {
    const result = await this.getEmployeeMetricsForPeriod(employeeId, period);
    if (!result.success || !result.data) {
      return { meets: false, belowThreshold: [] };
    }

    const belowThreshold = result.data.filter((m) => m.score < threshold);
    return {
      meets: belowThreshold.length === 0,
      belowThreshold,
    };
  }

  /**
   * Record new metric
   */
  async recordMetric(
    employeeId: string,
    kpiId: string,
    period: string,
    actualValue: number,
    targetValue: number
  ): Promise<ServiceResponse<PerformanceMetric>> {
    const score = Math.min(100, Math.round((actualValue / targetValue) * 100));
    
    const metric: Partial<PerformanceMetric> = {
      id: this.generateId(),
      employeeId,
      kpiId,
      period,
      actualValue,
      targetValue,
      score,
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };

    return this.create(metric);
  }
}

/**
 * Quality Assessment Client
 */
export class QualityAssessmentClient extends BaseServiceClient<QualityAssessment> {
  constructor() {
    super(
      { ...getDataSourceConfig("performance"), id: "performance-assessments" },
      generateMockQualityAssessments(20)
    );
  }

  /**
   * Get assessments by employee
   */
  async getByEmployee(employeeId: string): Promise<ServiceResponse<QualityAssessment[]>> {
    return this.getWhere({ employeeId });
  }

  /**
   * Get assessments by assessor
   */
  async getByAssessor(assessorId: string): Promise<ServiceResponse<QualityAssessment[]>> {
    return this.getWhere({ assessorId });
  }

  /**
   * Get assessments by type
   */
  async getByType(
    assessmentType: QualityAssessment["assessmentType"]
  ): Promise<ServiceResponse<QualityAssessment[]>> {
    return this.getWhere({ assessmentType });
  }

  /**
   * Get recent assessments for employee
   */
  async getRecentAssessments(
    employeeId: string,
    limit: number = 5
  ): Promise<ServiceResponse<QualityAssessment[]>> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const sorted = result.data.sort(
      (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );
    return { success: true, data: sorted.slice(0, limit) };
  }

  /**
   * Create a quality assessment
   */
  async createAssessment(
    employeeId: string,
    assessorId: string,
    assessmentType: QualityAssessment["assessmentType"],
    criteria: QualityAssessment["criteria"],
    overallComments?: string
  ): Promise<ServiceResponse<QualityAssessment>> {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedScore = criteria.reduce((sum, c) => sum + (c.score * c.weight), 0);
    const score = Math.round(weightedScore / totalWeight);

    // Identify skill gaps (criteria with low scores)
    const skillGaps = criteria
      .filter((c) => c.score < 70)
      .map((c) => c.name.toLowerCase().replace(/\s+/g, "-"));

    // Generate recommendations based on skill gaps
    const recommendations = skillGaps.map(
      (gap) => `Complete training on ${gap.replace(/-/g, " ")}`
    );

    const assessment: Partial<QualityAssessment> = {
      id: this.generateId(),
      employeeId,
      assessorId,
      assessmentType,
      score,
      criteria,
      overallComments,
      skillGaps,
      recommendations,
      assessmentDate: this.getCurrentTimestamp(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };

    return this.create(assessment);
  }

  /**
   * Get average score for employee
   */
  async getAverageScore(employeeId: string): Promise<number> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data || result.data.length === 0) {
      return 0;
    }
    const totalScore = result.data.reduce((sum, a) => sum + a.score, 0);
    return totalScore / result.data.length;
  }

  /**
   * Get assessments with skill gaps
   */
  async getAssessmentsWithSkillGaps(employeeId: string): Promise<ServiceResponse<QualityAssessment[]>> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const withGaps = result.data.filter((a) => a.skillGaps.length > 0);
    return { success: true, data: withGaps };
  }
}

/**
 * Skill Gap Client
 */
export class SkillGapClient extends BaseServiceClient<SkillGap> {
  constructor() {
    super(
      { ...getDataSourceConfig("performance"), id: "performance-skill-gaps" },
      generateMockSkillGaps(15)
    );
  }

  /**
   * Get skill gaps by employee
   */
  async getByEmployee(employeeId: string): Promise<ServiceResponse<SkillGap[]>> {
    return this.getWhere({ employeeId });
  }

  /**
   * Get unresolved skill gaps
   */
  async getUnresolved(employeeId: string): Promise<ServiceResponse<SkillGap[]>> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const unresolved = result.data.filter((g) => !g.resolvedAt);
    return { success: true, data: unresolved };
  }

  /**
   * Get skill gaps by priority
   */
  async getByPriority(priority: SkillGap["priority"]): Promise<ServiceResponse<SkillGap[]>> {
    return this.getWhere({ priority });
  }

  /**
   * Create a skill gap
   */
  async createSkillGap(
    employeeId: string,
    skillName: string,
    currentLevel: number,
    requiredLevel: number,
    recommendedCourseIds: string[] = []
  ): Promise<ServiceResponse<SkillGap>> {
    const gap = requiredLevel - currentLevel;
    const priority: SkillGap["priority"] =
      gap >= 40 ? "high" : gap >= 20 ? "medium" : "low";

    const skillGap: Partial<SkillGap> = {
      id: this.generateId(),
      employeeId,
      skillName,
      currentLevel,
      requiredLevel,
      gap,
      priority,
      recommendedCourseIds,
      identifiedAt: this.getCurrentTimestamp(),
    };

    return this.create(skillGap);
  }

  /**
   * Resolve a skill gap
   */
  async resolveSkillGap(skillGapId: string): Promise<ServiceResponse<SkillGap>> {
    return this.update(skillGapId, { resolvedAt: this.getCurrentTimestamp() });
  }

  /**
   * Update skill level
   */
  async updateSkillLevel(
    skillGapId: string,
    newCurrentLevel: number
  ): Promise<ServiceResponse<SkillGap>> {
    const result = await this.getById(skillGapId);
    if (!result.success || !result.data) {
      return { success: false, error: "Skill gap not found" };
    }

    const gap = result.data.requiredLevel - newCurrentLevel;
    const updates: Partial<SkillGap> = {
      currentLevel: newCurrentLevel,
      gap,
    };

    if (newCurrentLevel >= result.data.requiredLevel) {
      updates.resolvedAt = this.getCurrentTimestamp();
    }

    return this.update(skillGapId, updates);
  }

  /**
   * Add recommended course
   */
  async addRecommendedCourse(
    skillGapId: string,
    courseId: string
  ): Promise<ServiceResponse<SkillGap>> {
    const result = await this.getById(skillGapId);
    if (!result.success || !result.data) {
      return { success: false, error: "Skill gap not found" };
    }

    const recommendedCourseIds = [...result.data.recommendedCourseIds, courseId];
    return this.update(skillGapId, { recommendedCourseIds });
  }
}

// Singleton instances
let kpiClientInstance: KPIClient | null = null;
let metricClientInstance: PerformanceMetricClient | null = null;
let assessmentClientInstance: QualityAssessmentClient | null = null;
let skillGapClientInstance: SkillGapClient | null = null;

export function getKPIClient(): KPIClient {
  if (!kpiClientInstance) {
    kpiClientInstance = new KPIClient();
  }
  return kpiClientInstance;
}

export function getPerformanceMetricClient(): PerformanceMetricClient {
  if (!metricClientInstance) {
    metricClientInstance = new PerformanceMetricClient();
  }
  return metricClientInstance;
}

export function getQualityAssessmentClient(): QualityAssessmentClient {
  if (!assessmentClientInstance) {
    assessmentClientInstance = new QualityAssessmentClient();
  }
  return assessmentClientInstance;
}

export function getSkillGapClient(): SkillGapClient {
  if (!skillGapClientInstance) {
    skillGapClientInstance = new SkillGapClient();
  }
  return skillGapClientInstance;
}

