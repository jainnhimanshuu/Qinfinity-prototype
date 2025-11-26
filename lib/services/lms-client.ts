import { Course, CourseEnrollment, ServiceResponse } from "@/types/services";
import { BaseServiceClient } from "./base-client";
import { getDataSourceConfig } from "@/lib/data-sources/config";
import { generateMockCourses, generateMockEnrollments } from "@/lib/data-sources/mock-providers";

/**
 * LMS Course Client
 * Handles course management
 */
export class LMSCourseClient extends BaseServiceClient<Course> {
  constructor() {
    super(getDataSourceConfig("lms"), generateMockCourses(15));
  }

  /**
   * Get courses by category
   */
  async getByCategory(category: string): Promise<ServiceResponse<Course[]>> {
    return this.getWhere({ category });
  }

  /**
   * Get courses by skill tag
   */
  async getBySkillTag(skillTag: string): Promise<ServiceResponse<Course[]>> {
    const result = await this.getAll();
    const filtered = result.data.filter((course) =>
      course.skillTags.some((tag) => tag.toLowerCase().includes(skillTag.toLowerCase()))
    );
    return { success: true, data: filtered };
  }

  /**
   * Get courses by level
   */
  async getByLevel(level: Course["level"]): Promise<ServiceResponse<Course[]>> {
    return this.getWhere({ level });
  }

  /**
   * Get published courses
   */
  async getPublishedCourses(): Promise<ServiceResponse<Course[]>> {
    return this.getWhere({ status: "published" });
  }

  /**
   * Search courses by title or description
   */
  async search(query: string): Promise<ServiceResponse<Course[]>> {
    const result = await this.getAll();
    const filtered = result.data.filter(
      (course) =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, data: filtered };
  }

  /**
   * Get recommended courses for skill gaps
   */
  async getRecommendedForSkillGap(skillGap: string): Promise<ServiceResponse<Course[]>> {
    const result = await this.getAll();
    const filtered = result.data.filter(
      (course) =>
        course.skillTags.some((tag) =>
          tag.toLowerCase().includes(skillGap.toLowerCase())
        ) ||
        course.title.toLowerCase().includes(skillGap.toLowerCase())
    );
    return { success: true, data: filtered };
  }
}

/**
 * LMS Enrollment Client
 * Handles course enrollments
 */
export class LMSEnrollmentClient extends BaseServiceClient<CourseEnrollment> {
  constructor() {
    super(
      { ...getDataSourceConfig("lms"), id: "lms-enrollments" },
      generateMockEnrollments(30)
    );
  }

  /**
   * Get enrollments by employee
   */
  async getByEmployee(employeeId: string): Promise<ServiceResponse<CourseEnrollment[]>> {
    return this.getWhere({ employeeId });
  }

  /**
   * Get enrollments by course
   */
  async getByCourse(courseId: string): Promise<ServiceResponse<CourseEnrollment[]>> {
    return this.getWhere({ courseId });
  }

  /**
   * Get enrollments by status
   */
  async getByStatus(status: CourseEnrollment["status"]): Promise<ServiceResponse<CourseEnrollment[]>> {
    return this.getWhere({ status });
  }

  /**
   * Enroll employee in course
   */
  async enroll(employeeId: string, courseId: string): Promise<ServiceResponse<CourseEnrollment>> {
    const enrollment: Partial<CourseEnrollment> = {
      id: this.generateId(),
      employeeId,
      courseId,
      status: "enrolled",
      progress: 0,
      enrolledAt: this.getCurrentTimestamp(),
    };
    return this.create(enrollment);
  }

  /**
   * Start course
   */
  async startCourse(enrollmentId: string): Promise<ServiceResponse<CourseEnrollment>> {
    return this.update(enrollmentId, { status: "in_progress" });
  }

  /**
   * Update progress
   */
  async updateProgress(enrollmentId: string, progress: number): Promise<ServiceResponse<CourseEnrollment>> {
    const updates: Partial<CourseEnrollment> = { progress };
    if (progress >= 100) {
      updates.status = "completed";
      updates.completedAt = this.getCurrentTimestamp();
    }
    return this.update(enrollmentId, updates);
  }

  /**
   * Complete course
   */
  async completeCourse(enrollmentId: string, score?: number): Promise<ServiceResponse<CourseEnrollment>> {
    return this.update(enrollmentId, {
      status: "completed",
      progress: 100,
      completedAt: this.getCurrentTimestamp(),
      score,
      certificateId: `cert-${this.generateId()}`,
    });
  }

  /**
   * Drop course
   */
  async dropCourse(enrollmentId: string): Promise<ServiceResponse<CourseEnrollment>> {
    return this.update(enrollmentId, { status: "dropped" });
  }

  /**
   * Check if employee is enrolled in course
   */
  async isEnrolled(employeeId: string, courseId: string): Promise<boolean> {
    const result = await this.getAll();
    return result.data.some(
      (enrollment) =>
        enrollment.employeeId === employeeId &&
        enrollment.courseId === courseId &&
        enrollment.status !== "dropped"
    );
  }

  /**
   * Get active enrollments for employee
   */
  async getActiveEnrollments(employeeId: string): Promise<ServiceResponse<CourseEnrollment[]>> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const active = result.data.filter(
      (e) => e.status === "enrolled" || e.status === "in_progress"
    );
    return { success: true, data: active };
  }
}

// Singleton instances
let courseClientInstance: LMSCourseClient | null = null;
let enrollmentClientInstance: LMSEnrollmentClient | null = null;

export function getLMSCourseClient(): LMSCourseClient {
  if (!courseClientInstance) {
    courseClientInstance = new LMSCourseClient();
  }
  return courseClientInstance;
}

export function getLMSEnrollmentClient(): LMSEnrollmentClient {
  if (!enrollmentClientInstance) {
    enrollmentClientInstance = new LMSEnrollmentClient();
  }
  return enrollmentClientInstance;
}

