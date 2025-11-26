// Base service client
export * from "./base-client";

// H2R (HR Portal) clients
export * from "./h2r-client";

// LMS (Learning Management System) clients
export * from "./lms-client";

// WFM (Workforce Management) clients
export * from "./wfm-client";

// Ticketing System client
export * from "./ticketing-client";

// Performance Management clients
export * from "./performance-client";

// Unified service access
import { getH2REmployeeClient, getH2RRequisitionClient } from "./h2r-client";
import { getLMSCourseClient, getLMSEnrollmentClient } from "./lms-client";
import { getWFMShiftClient, getWFMAttendanceClient } from "./wfm-client";
import { getTicketingClient } from "./ticketing-client";
import {
  getKPIClient,
  getPerformanceMetricClient,
  getQualityAssessmentClient,
  getSkillGapClient,
} from "./performance-client";

/**
 * Unified service registry for easy access to all service clients
 */
export const services = {
  // H2R
  h2r: {
    employees: getH2REmployeeClient,
    requisitions: getH2RRequisitionClient,
  },
  // LMS
  lms: {
    courses: getLMSCourseClient,
    enrollments: getLMSEnrollmentClient,
  },
  // WFM
  wfm: {
    shifts: getWFMShiftClient,
    attendance: getWFMAttendanceClient,
  },
  // Ticketing
  ticketing: {
    tickets: getTicketingClient,
  },
  // Performance
  performance: {
    kpis: getKPIClient,
    metrics: getPerformanceMetricClient,
    assessments: getQualityAssessmentClient,
    skillGaps: getSkillGapClient,
  },
};

/**
 * Get all service clients
 */
export function getAllServiceClients() {
  return {
    h2rEmployees: getH2REmployeeClient(),
    h2rRequisitions: getH2RRequisitionClient(),
    lmsCourses: getLMSCourseClient(),
    lmsEnrollments: getLMSEnrollmentClient(),
    wfmShifts: getWFMShiftClient(),
    wfmAttendance: getWFMAttendanceClient(),
    tickets: getTicketingClient(),
    kpis: getKPIClient(),
    performanceMetrics: getPerformanceMetricClient(),
    qualityAssessments: getQualityAssessmentClient(),
    skillGaps: getSkillGapClient(),
  };
}

