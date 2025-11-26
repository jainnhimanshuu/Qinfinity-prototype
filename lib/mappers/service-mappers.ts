import {
  Employee,
  HiringRequisition,
  Course,
  CourseEnrollment,
  Shift,
  Attendance,
  Ticket,
  PerformanceMetric,
  QualityAssessment,
  SkillGap,
  KPI,
} from "@/types/services";
import { CustomMapper, IdentityMapper, IMapper, transformUtils } from "./base-mapper";

/**
 * External API response types (snake_case format typically used by REST APIs)
 */
interface ExternalEmployee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  manager_id?: string;
  status: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

interface ExternalHiringRequisition {
  id: string;
  title: string;
  department: string;
  requested_by: string;
  status: string;
  position: string;
  description?: string;
  requirements: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  work_mode: string;
  shift_timings?: string;
  perks: string[];
  compensation?: string;
  ticket_ids: string[];
  created_at: string;
  updated_at: string;
}

interface ExternalCourse {
  id: string;
  course_title: string;
  course_description: string;
  category: string;
  skill_tags: string[];
  duration_minutes: number;
  level: string;
  instructor?: string;
  modules: Array<{
    id: string;
    title: string;
    duration: number;
    order: number;
  }>;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ExternalTicket {
  id: string;
  ticket_title: string;
  ticket_description: string;
  category: string;
  priority: string;
  ticket_status: string;
  assignee_id?: string;
  reporter_id: string;
  related_entity_type?: string;
  related_entity_id?: string;
  due_date?: string;
  tags: string[];
  comments: Array<{
    id: string;
    author_id: string;
    content: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

/**
 * Employee mapper - transforms between external and internal formats
 */
export const employeeMapper: IMapper<ExternalEmployee, Employee> = new CustomMapper(
  (external) => ({
    id: external.id,
    employeeId: external.employee_id,
    firstName: external.first_name,
    lastName: external.last_name,
    email: external.email,
    department: external.department,
    position: external.position,
    managerId: external.manager_id,
    status: external.status as Employee["status"],
    hireDate: external.hire_date,
    createdAt: external.created_at,
    updatedAt: external.updated_at,
  }),
  (internal) => ({
    id: internal.id,
    employee_id: internal.employeeId,
    first_name: internal.firstName,
    last_name: internal.lastName,
    email: internal.email,
    department: internal.department,
    position: internal.position,
    manager_id: internal.managerId,
    status: internal.status,
    hire_date: internal.hireDate,
    created_at: internal.createdAt,
    updated_at: internal.updatedAt,
  })
);

/**
 * Hiring requisition mapper
 */
export const hiringRequisitionMapper: IMapper<ExternalHiringRequisition, HiringRequisition> = new CustomMapper(
  (external) => ({
    id: external.id,
    title: external.title,
    department: external.department,
    requestedBy: external.requested_by,
    status: external.status as HiringRequisition["status"],
    position: external.position,
    description: external.description,
    requirements: external.requirements,
    salary: external.salary_min !== undefined ? {
      min: external.salary_min,
      max: external.salary_max || external.salary_min,
      currency: external.salary_currency || "USD",
    } : undefined,
    workMode: external.work_mode as HiringRequisition["workMode"],
    shiftTimings: external.shift_timings,
    perks: external.perks,
    compensation: external.compensation,
    ticketIds: external.ticket_ids,
    createdAt: external.created_at,
    updatedAt: external.updated_at,
  }),
  (internal) => ({
    id: internal.id,
    title: internal.title,
    department: internal.department,
    requested_by: internal.requestedBy,
    status: internal.status,
    position: internal.position,
    description: internal.description,
    requirements: internal.requirements,
    salary_min: internal.salary?.min,
    salary_max: internal.salary?.max,
    salary_currency: internal.salary?.currency,
    work_mode: internal.workMode,
    shift_timings: internal.shiftTimings,
    perks: internal.perks,
    compensation: internal.compensation,
    ticket_ids: internal.ticketIds,
    created_at: internal.createdAt,
    updated_at: internal.updatedAt,
  })
);

/**
 * Course mapper
 */
export const courseMapper: IMapper<ExternalCourse, Course> = new CustomMapper(
  (external) => ({
    id: external.id,
    title: external.course_title,
    description: external.course_description,
    category: external.category,
    skillTags: external.skill_tags,
    duration: external.duration_minutes,
    level: external.level as Course["level"],
    instructor: external.instructor,
    modules: external.modules,
    status: external.status as Course["status"],
    createdAt: external.created_at,
    updatedAt: external.updated_at,
  }),
  (internal) => ({
    id: internal.id,
    course_title: internal.title,
    course_description: internal.description,
    category: internal.category,
    skill_tags: internal.skillTags,
    duration_minutes: internal.duration,
    level: internal.level,
    instructor: internal.instructor,
    modules: internal.modules,
    status: internal.status,
    created_at: internal.createdAt,
    updated_at: internal.updatedAt,
  })
);

/**
 * Ticket mapper
 */
export const ticketMapper: IMapper<ExternalTicket, Ticket> = new CustomMapper(
  (external) => ({
    id: external.id,
    title: external.ticket_title,
    description: external.ticket_description,
    category: external.category as Ticket["category"],
    priority: external.priority as Ticket["priority"],
    status: external.ticket_status as Ticket["status"],
    assigneeId: external.assignee_id,
    reporterId: external.reporter_id,
    relatedEntityType: external.related_entity_type,
    relatedEntityId: external.related_entity_id,
    dueDate: external.due_date,
    tags: external.tags,
    comments: external.comments.map((c) => ({
      id: c.id,
      authorId: c.author_id,
      content: c.content,
      createdAt: c.created_at,
    })),
    createdAt: external.created_at,
    updatedAt: external.updated_at,
    resolvedAt: external.resolved_at,
  }),
  (internal) => ({
    id: internal.id,
    ticket_title: internal.title,
    ticket_description: internal.description,
    category: internal.category,
    priority: internal.priority,
    ticket_status: internal.status,
    assignee_id: internal.assigneeId,
    reporter_id: internal.reporterId,
    related_entity_type: internal.relatedEntityType,
    related_entity_id: internal.relatedEntityId,
    due_date: internal.dueDate,
    tags: internal.tags,
    comments: internal.comments.map((c) => ({
      id: c.id,
      author_id: c.authorId,
      content: c.content,
      created_at: c.createdAt,
    })),
    created_at: internal.createdAt,
    updated_at: internal.updatedAt,
    resolved_at: internal.resolvedAt,
  })
);

/**
 * Identity mappers for types that don't need transformation
 * (when internal format matches the mock data format)
 */
export const courseEnrollmentMapper = new IdentityMapper<CourseEnrollment>();
export const shiftMapper = new IdentityMapper<Shift>();
export const attendanceMapper = new IdentityMapper<Attendance>();
export const performanceMetricMapper = new IdentityMapper<PerformanceMetric>();
export const qualityAssessmentMapper = new IdentityMapper<QualityAssessment>();
export const skillGapMapper = new IdentityMapper<SkillGap>();
export const kpiMapper = new IdentityMapper<KPI>();

/**
 * Mapper registry for easy access to all mappers
 */
export const mapperRegistry = {
  employee: employeeMapper,
  hiringRequisition: hiringRequisitionMapper,
  course: courseMapper,
  courseEnrollment: courseEnrollmentMapper,
  shift: shiftMapper,
  attendance: attendanceMapper,
  ticket: ticketMapper,
  performanceMetric: performanceMetricMapper,
  qualityAssessment: qualityAssessmentMapper,
  skillGap: skillGapMapper,
  kpi: kpiMapper,
};

/**
 * Get mapper by entity type
 */
export function getMapper<TSource, TTarget>(entityType: keyof typeof mapperRegistry): IMapper<TSource, TTarget> {
  return mapperRegistry[entityType] as unknown as IMapper<TSource, TTarget>;
}

// Re-export transform utilities
export { transformUtils };

