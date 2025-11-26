import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMemo } from "react";
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
import { Event } from "@/types/events";
import {
  generateMockEmployees,
  generateMockHiringRequisitions,
  generateMockCourses,
  generateMockEnrollments,
  generateMockShifts,
  generateMockAttendance,
  generateMockTickets,
  generateMockKPIs,
  generateMockPerformanceMetrics,
  generateMockQualityAssessments,
  generateMockSkillGaps,
} from "@/lib/data-sources/mock-providers";

/**
 * Store state interface
 */
export interface StoreState {
  // H2R data
  employees: Map<string, Employee>;
  hiringRequisitions: Map<string, HiringRequisition>;

  // LMS data
  courses: Map<string, Course>;
  enrollments: Map<string, CourseEnrollment>;

  // WFM data
  shifts: Map<string, Shift>;
  attendance: Map<string, Attendance>;

  // Ticketing data
  tickets: Map<string, Ticket>;

  // Performance data
  kpis: Map<string, KPI>;
  performanceMetrics: Map<string, PerformanceMetric>;
  qualityAssessments: Map<string, QualityAssessment>;
  skillGaps: Map<string, SkillGap>;

  // Event history
  eventHistory: Event[];

  // Initialization flag
  initialized: boolean;
}

/**
 * Store actions interface
 */
export interface StoreActions {
  // Initialize store with mock data
  initialize: () => void;
  reset: () => void;

  // Generic CRUD operations
  getEntity: <T>(collection: keyof StoreState, id: string) => T | undefined;
  setEntity: <T>(collection: keyof StoreState, id: string, entity: T) => void;
  deleteEntity: (collection: keyof StoreState, id: string) => void;
  getAllEntities: <T>(collection: keyof StoreState) => T[];

  // H2R actions
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addHiringRequisition: (requisition: HiringRequisition) => void;
  updateHiringRequisition: (id: string, updates: Partial<HiringRequisition>) => void;

  // LMS actions
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  addEnrollment: (enrollment: CourseEnrollment) => void;
  updateEnrollment: (id: string, updates: Partial<CourseEnrollment>) => void;

  // Ticketing actions
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;

  // Performance actions
  addQualityAssessment: (assessment: QualityAssessment) => void;
  addSkillGap: (skillGap: SkillGap) => void;
  updateSkillGap: (id: string, updates: Partial<SkillGap>) => void;
  addPerformanceMetric: (metric: PerformanceMetric) => void;

  // Event actions
  addEvent: (event: Event) => void;
  getEventsByType: (type: string) => Event[];
}

/**
 * Create initial empty state
 */
const createInitialState = (): StoreState => ({
  employees: new Map(),
  hiringRequisitions: new Map(),
  courses: new Map(),
  enrollments: new Map(),
  shifts: new Map(),
  attendance: new Map(),
  tickets: new Map(),
  kpis: new Map(),
  performanceMetrics: new Map(),
    qualityAssessments: new Map(),
    skillGaps: new Map(),
    eventHistory: [],
  initialized: false,
});

/**
 * Helper to convert array to Map
 */
function arrayToMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/**
 * Main application store using Zustand
 */
export const useStore = create<StoreState & StoreActions>()(
  subscribeWithSelector((set, get) => ({
    ...createInitialState(),

    // Initialize store with mock data
    initialize: () => {
      if (get().initialized) return;

      set({
        employees: arrayToMap(generateMockEmployees(20)),
        hiringRequisitions: arrayToMap(generateMockHiringRequisitions(10)),
        courses: arrayToMap(generateMockCourses(15)),
        enrollments: arrayToMap(generateMockEnrollments(30)),
        shifts: arrayToMap(generateMockShifts(50)),
        attendance: arrayToMap(generateMockAttendance(50)),
        tickets: arrayToMap(generateMockTickets(25)),
        kpis: arrayToMap(generateMockKPIs(10)),
        performanceMetrics: arrayToMap(generateMockPerformanceMetrics(40)),
        qualityAssessments: arrayToMap(generateMockQualityAssessments(20)),
        skillGaps: arrayToMap(generateMockSkillGaps(15)),
        initialized: true,
      });
    },

    reset: () => {
      set(createInitialState());
    },

    // Generic CRUD operations
    getEntity: <T>(collection: keyof StoreState, id: string): T | undefined => {
      const map = get()[collection] as Map<string, T>;
      return map?.get(id);
    },

    setEntity: <T>(collection: keyof StoreState, id: string, entity: T) => {
      set((state) => {
        const map = new Map(state[collection] as Map<string, T>);
        map.set(id, entity);
        return { [collection]: map } as Partial<StoreState>;
      });
    },

    deleteEntity: (collection: keyof StoreState, id: string) => {
      set((state) => {
        const map = new Map(state[collection] as Map<string, unknown>);
        map.delete(id);
        return { [collection]: map } as Partial<StoreState>;
      });
    },

    getAllEntities: <T>(collection: keyof StoreState): T[] => {
      const map = get()[collection] as Map<string, T>;
      return Array.from(map?.values() || []);
    },

    // H2R actions
    addEmployee: (employee) => {
      set((state) => {
        const employees = new Map(state.employees);
        employees.set(employee.id, employee);
        return { employees };
      });
    },

    updateEmployee: (id, updates) => {
      set((state) => {
        const employees = new Map(state.employees);
        const existing = employees.get(id);
        if (existing) {
          employees.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() });
        }
        return { employees };
      });
    },

    deleteEmployee: (id) => {
      set((state) => {
        const employees = new Map(state.employees);
        employees.delete(id);
        return { employees };
      });
    },

    addHiringRequisition: (requisition) => {
      set((state) => {
        const hiringRequisitions = new Map(state.hiringRequisitions);
        hiringRequisitions.set(requisition.id, requisition);
        return { hiringRequisitions };
      });
    },

    updateHiringRequisition: (id, updates) => {
      set((state) => {
        const hiringRequisitions = new Map(state.hiringRequisitions);
        const existing = hiringRequisitions.get(id);
        if (existing) {
          hiringRequisitions.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() });
        }
        return { hiringRequisitions };
      });
    },

    // LMS actions
    addCourse: (course) => {
      set((state) => {
        const courses = new Map(state.courses);
        courses.set(course.id, course);
        return { courses };
      });
    },

    updateCourse: (id, updates) => {
      set((state) => {
        const courses = new Map(state.courses);
        const existing = courses.get(id);
        if (existing) {
          courses.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() });
        }
        return { courses };
      });
    },

    addEnrollment: (enrollment) => {
      set((state) => {
        const enrollments = new Map(state.enrollments);
        enrollments.set(enrollment.id, enrollment);
        return { enrollments };
      });
    },

    updateEnrollment: (id, updates) => {
      set((state) => {
        const enrollments = new Map(state.enrollments);
        const existing = enrollments.get(id);
        if (existing) {
          enrollments.set(id, { ...existing, ...updates });
        }
        return { enrollments };
      });
    },

    // Ticketing actions
    addTicket: (ticket) => {
      set((state) => {
        const tickets = new Map(state.tickets);
        tickets.set(ticket.id, ticket);
        return { tickets };
      });
    },

    updateTicket: (id, updates) => {
      set((state) => {
        const tickets = new Map(state.tickets);
        const existing = tickets.get(id);
        if (existing) {
          tickets.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() });
        }
        return { tickets };
      });
    },

    deleteTicket: (id) => {
      set((state) => {
        const tickets = new Map(state.tickets);
        tickets.delete(id);
        return { tickets };
      });
    },

    // Performance actions
    addQualityAssessment: (assessment) => {
      set((state) => {
        const qualityAssessments = new Map(state.qualityAssessments);
        qualityAssessments.set(assessment.id, assessment);
        return { qualityAssessments };
      });
    },

    addSkillGap: (skillGap) => {
      set((state) => {
        const skillGaps = new Map(state.skillGaps);
        skillGaps.set(skillGap.id, skillGap);
        return { skillGaps };
      });
    },

    updateSkillGap: (id, updates) => {
      set((state) => {
        const skillGaps = new Map(state.skillGaps);
        const existing = skillGaps.get(id);
        if (existing) {
          skillGaps.set(id, { ...existing, ...updates });
        }
        return { skillGaps };
      });
    },

    addPerformanceMetric: (metric) => {
      set((state) => {
        const performanceMetrics = new Map(state.performanceMetrics);
        performanceMetrics.set(metric.id, metric);
        return { performanceMetrics };
      });
    },

    // Event actions
    addEvent: (event) => {
      set((state) => ({
        eventHistory: [...state.eventHistory, event].slice(-1000), // Keep last 1000 events
      }));
    },

    getEventsByType: (type) => {
      return get().eventHistory.filter((e) => e.type === type);
    },
  }))
);

/**
 * Helper to create stable array selectors that cache results
 * Uses a serialized key based on map size and keys to detect actual changes
 */
function createArraySelector<T>(selector: (state: StoreState) => Map<string, T>) {
  return () => {
    const map = useStore(selector);
    // Create a stable key based on map size and keys for memoization
    const mapKey = useMemo(() => {
      return `${map.size}-${Array.from(map.keys()).sort().join(',')}`;
    }, [map]);
    
    return useMemo(() => Array.from(map.values()), [mapKey]);
  };
}

/**
 * Selector hooks for specific data slices
 * Using memoized selectors to ensure stable references and prevent server snapshot issues
 */
export const useEmployees = createArraySelector<Employee>((state) => state.employees);
export const useHiringRequisitions = createArraySelector<HiringRequisition>((state) => state.hiringRequisitions);
export const useCourses = createArraySelector<Course>((state) => state.courses);
export const useEnrollments = createArraySelector<CourseEnrollment>((state) => state.enrollments);
export const useShifts = createArraySelector<Shift>((state) => state.shifts);
export const useAttendance = createArraySelector<Attendance>((state) => state.attendance);
export const useTickets = createArraySelector<Ticket>((state) => state.tickets);
export const useKPIs = createArraySelector<KPI>((state) => state.kpis);
export const usePerformanceMetrics = createArraySelector<PerformanceMetric>((state) => state.performanceMetrics);
export const useQualityAssessments = createArraySelector<QualityAssessment>((state) => state.qualityAssessments);
export const useSkillGaps = createArraySelector<SkillGap>((state) => state.skillGaps);
export const useEventHistory = () => useStore((state) => state.eventHistory);


