import { z } from "zod";

// Base entity schema
export const BaseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Employee schema (used across multiple services)
export const EmployeeSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  department: z.string(),
  position: z.string(),
  managerId: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave", "terminated"]),
  hireDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Employee = z.infer<typeof EmployeeSchema>;

// H2R (HR Portal) Types
export const HiringRequisitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
  requestedBy: z.string(),
  status: z.enum(["draft", "pending", "approved", "in_progress", "completed", "cancelled"]),
  position: z.string(),
  description: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  salary: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default("USD"),
  }).optional(),
  workMode: z.enum(["onsite", "hybrid", "remote"]),
  shiftTimings: z.string().optional(),
  perks: z.array(z.string()).default([]),
  compensation: z.string().optional(),
  ticketIds: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type HiringRequisition = z.infer<typeof HiringRequisitionSchema>;

// LMS (Learning Management System) Types
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  skillTags: z.array(z.string()).default([]),
  duration: z.number(), // in minutes
  level: z.enum(["beginner", "intermediate", "advanced"]),
  instructor: z.string().optional(),
  modules: z.array(z.object({
    id: z.string(),
    title: z.string(),
    duration: z.number(),
    order: z.number(),
  })).default([]),
  status: z.enum(["draft", "published", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseEnrollmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  employeeId: z.string(),
  status: z.enum(["enrolled", "in_progress", "completed", "dropped"]),
  progress: z.number().min(0).max(100),
  enrolledAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  score: z.number().optional(),
  certificateId: z.string().optional(),
});
export type CourseEnrollment = z.infer<typeof CourseEnrollmentSchema>;

// WFM (Workforce Management) Types
export const ShiftSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.enum(["regular", "overtime", "on_call"]),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Shift = z.infer<typeof ShiftSchema>;

export const AttendanceSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  date: z.string(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.enum(["present", "absent", "late", "half_day", "on_leave"]),
  hoursWorked: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Attendance = z.infer<typeof AttendanceSchema>;

// Ticketing System Types
export const TicketPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

export const TicketCategorySchema = z.enum([
  "procurement",
  "facilities",
  "it_support",
  "hr",
  "project",
  "training",
  "general",
]);
export type TicketCategory = z.infer<typeof TicketCategorySchema>;

export const TicketSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: TicketCategorySchema,
  priority: TicketPrioritySchema,
  status: z.enum(["open", "in_progress", "pending", "resolved", "closed", "cancelled"]),
  assigneeId: z.string().optional(),
  reporterId: z.string(),
  relatedEntityType: z.string().optional(), // e.g., "hiring_requisition", "course_enrollment"
  relatedEntityId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  comments: z.array(z.object({
    id: z.string(),
    authorId: z.string(),
    content: z.string(),
    createdAt: z.string().datetime(),
  })).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});
export type Ticket = z.infer<typeof TicketSchema>;

// Performance Management Types
export const KPISchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  targetValue: z.number(),
  unit: z.string(),
  weight: z.number().min(0).max(100),
});
export type KPI = z.infer<typeof KPISchema>;

export const PerformanceMetricSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  kpiId: z.string(),
  period: z.string(), // e.g., "2024-Q1", "2024-01"
  actualValue: z.number(),
  targetValue: z.number(),
  score: z.number().min(0).max(100),
  trend: z.enum(["improving", "stable", "declining"]).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;

export const QualityAssessmentSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  assessorId: z.string(),
  assessmentType: z.enum(["call_quality", "task_quality", "peer_review", "manager_review"]),
  score: z.number().min(0).max(100),
  criteria: z.array(z.object({
    name: z.string(),
    score: z.number(),
    weight: z.number(),
    comments: z.string().optional(),
  })),
  overallComments: z.string().optional(),
  skillGaps: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  assessmentDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type QualityAssessment = z.infer<typeof QualityAssessmentSchema>;

export const SkillGapSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  skillName: z.string(),
  currentLevel: z.number().min(0).max(100),
  requiredLevel: z.number().min(0).max(100),
  gap: z.number(),
  priority: z.enum(["low", "medium", "high"]),
  recommendedCourseIds: z.array(z.string()).default([]),
  identifiedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});
export type SkillGap = z.infer<typeof SkillGapSchema>;

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// Service client interface
export interface ServiceClient<T> {
  getAll(params?: Record<string, unknown>): Promise<ServiceResponse<T[]>>;
  getById(id: string): Promise<ServiceResponse<T>>;
  create(data: Partial<T>): Promise<ServiceResponse<T>>;
  update(id: string, data: Partial<T>): Promise<ServiceResponse<T>>;
  delete(id: string): Promise<ServiceResponse<void>>;
}

