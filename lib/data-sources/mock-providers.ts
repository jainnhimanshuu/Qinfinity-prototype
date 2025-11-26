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

/**
 * Generate mock employees
 */
export function generateMockEmployees(count: number = 50): Employee[] {
  const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Support"];
  const positions = ["Junior", "Senior", "Lead", "Manager", "Director"];
  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Maria"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Anderson"];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const department = departments[i % departments.length];
    const position = positions[i % positions.length];

    return {
      id: `emp-${i + 1}`,
      employeeId: `EMP${String(i + 1).padStart(5, "0")}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      department,
      position: `${position} ${department === "Engineering" ? "Engineer" : "Specialist"}`,
      managerId: i > 0 ? `emp-${Math.floor(i / 5) + 1}` : undefined,
      status: i % 10 === 0 ? "on_leave" : "active",
      hireDate: new Date(2020 + Math.floor(i / 10), i % 12, (i % 28) + 1).toISOString(),
      createdAt: new Date(2020, 0, 1).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate mock hiring requisitions
 */
export function generateMockHiringRequisitions(count: number = 25): HiringRequisition[] {
  const titles = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Analyst",
    "DevOps Engineer",
    "Sales Representative",
    "Marketing Specialist",
    "HR Coordinator",
    "Financial Analyst",
    "Customer Support Agent",
  ];
  const departments = ["Engineering", "Product", "Design", "Analytics", "Operations", "Sales", "Marketing", "HR", "Finance", "Support"];
  const statuses: HiringRequisition["status"][] = ["draft", "pending", "approved", "in_progress", "completed"];
  const workModes: HiringRequisition["workMode"][] = ["onsite", "hybrid", "remote"];

  return Array.from({ length: count }, (_, i) => ({
    id: `req-${i + 1}`,
    title: titles[i % titles.length],
    department: departments[i % departments.length],
    requestedBy: `emp-${(i % 5) + 1}`,
    status: statuses[i % statuses.length],
    position: titles[i % titles.length],
    description: `Looking for a talented ${titles[i % titles.length]} to join our ${departments[i % departments.length]} team.`,
    requirements: ["3+ years experience", "Strong communication skills", "Team player"],
    salary: {
      min: 50000 + i * 10000,
      max: 80000 + i * 10000,
      currency: "USD",
    },
    workMode: workModes[i % workModes.length],
    shiftTimings: "9 AM - 6 PM",
    perks: ["Health Insurance", "401k", "Remote Work Options"],
    compensation: "Competitive salary with performance bonuses",
    ticketIds: i % 3 === 0 ? [`ticket-${i * 3 + 1}`, `ticket-${i * 3 + 2}`, `ticket-${i * 3 + 3}`] : [],
    createdAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Generate mock courses
 */
export function generateMockCourses(count: number = 30): Course[] {
  const courseTitles = [
    "Communication Skills Mastery",
    "Customer Service Excellence",
    "Technical Writing Fundamentals",
    "Leadership Development",
    "Project Management Basics",
    "Data Analysis with Excel",
    "Effective Presentation Skills",
    "Time Management Strategies",
    "Conflict Resolution",
    "Sales Techniques",
    "Digital Marketing Fundamentals",
    "Python Programming",
    "Agile Methodology",
    "Emotional Intelligence",
    "Problem Solving Skills",
  ];
  const categories = ["Soft Skills", "Technical", "Management", "Sales", "Marketing"];
  const levels: Course["level"][] = ["beginner", "intermediate", "advanced"];

  return Array.from({ length: count }, (_, i) => ({
    id: `course-${i + 1}`,
    title: courseTitles[i % courseTitles.length],
    description: `Comprehensive course on ${courseTitles[i % courseTitles.length].toLowerCase()} designed for professional development.`,
    category: categories[i % categories.length],
    skillTags: [categories[i % categories.length].toLowerCase(), "professional-development"],
    duration: 60 + (i % 5) * 30, // 60-180 minutes
    level: levels[i % levels.length],
    instructor: `Instructor ${i + 1}`,
    modules: Array.from({ length: 3 + (i % 3) }, (_, j) => ({
      id: `module-${i + 1}-${j + 1}`,
      title: `Module ${j + 1}: ${["Introduction", "Core Concepts", "Advanced Topics", "Practical Applications", "Assessment"][j % 5]}`,
      duration: 15 + (j % 3) * 10,
      order: j + 1,
    })),
    status: "published",
    createdAt: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Generate mock course enrollments
 */
export function generateMockEnrollments(count: number = 80): CourseEnrollment[] {
  const statuses: CourseEnrollment["status"][] = ["enrolled", "in_progress", "completed", "dropped"];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    const progress = status === "completed" ? 100 : status === "dropped" ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 100);

    return {
      id: `enrollment-${i + 1}`,
      courseId: `course-${(i % 15) + 1}`,
      employeeId: `emp-${(i % 20) + 1}`,
      status,
      progress,
      enrolledAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
      score: status === "completed" ? 70 + Math.floor(Math.random() * 30) : undefined,
      certificateId: status === "completed" ? `cert-${i + 1}` : undefined,
    };
  });
}

/**
 * Generate mock shifts
 */
export function generateMockShifts(count: number = 150): Shift[] {
  const types: Shift["type"][] = ["regular", "overtime", "on_call"];
  const statuses: Shift["status"][] = ["scheduled", "completed", "cancelled", "no_show"];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - i));

    return {
      id: `shift-${i + 1}`,
      employeeId: `emp-${(i % 20) + 1}`,
      date: date.toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      createdAt: new Date(2024, 0, 1).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate mock attendance records
 */
export function generateMockAttendance(count: number = 200): Attendance[] {
  const statuses: Attendance["status"][] = ["present", "absent", "late", "half_day", "on_leave"];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - i));
    const status = statuses[i % statuses.length];

    return {
      id: `attendance-${i + 1}`,
      employeeId: `emp-${(i % 20) + 1}`,
      date: date.toISOString().split("T")[0],
      checkIn: status !== "absent" && status !== "on_leave" ? `${date.toISOString().split("T")[0]}T09:${String(i % 30).padStart(2, "0")}:00.000Z` : undefined,
      checkOut: status === "present" || status === "late" ? `${date.toISOString().split("T")[0]}T17:${String(i % 30).padStart(2, "0")}:00.000Z` : undefined,
      status,
      hoursWorked: status === "present" ? 8 : status === "late" ? 7.5 : status === "half_day" ? 4 : 0,
      createdAt: new Date(2024, 0, 1).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate mock tickets
 */
export function generateMockTickets(count: number = 60): Ticket[] {
  const titles = [
    "Laptop Setup Required",
    "Access Card Request",
    "Desk Allocation",
    "Software Installation",
    "Network Issue",
    "Training Assignment",
    "Equipment Procurement",
    "Workspace Setup",
    "System Access Request",
    "Performance Review Follow-up",
  ];
  const categories: Ticket["category"][] = ["procurement", "facilities", "it_support", "hr", "project", "training", "general"];
  const priorities: Ticket["priority"][] = ["low", "medium", "high", "critical"];
  const statuses: Ticket["status"][] = ["open", "in_progress", "pending", "resolved", "closed"];

  return Array.from({ length: count }, (_, i) => ({
    id: `ticket-${i + 1}`,
    title: titles[i % titles.length],
    description: `${titles[i % titles.length]} - Detailed description for ticket ${i + 1}`,
    category: categories[i % categories.length],
    priority: priorities[i % priorities.length],
    status: statuses[i % statuses.length],
    assigneeId: `emp-${(i % 10) + 1}`,
    reporterId: `emp-${(i % 20) + 1}`,
    relatedEntityType: i % 3 === 0 ? "hiring_requisition" : undefined,
    relatedEntityId: i % 3 === 0 ? `req-${Math.floor(i / 3) + 1}` : undefined,
    dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["onboarding", categories[i % categories.length]],
    comments: [
      {
        id: `comment-${i}-1`,
        authorId: `emp-${(i % 5) + 1}`,
        content: "Initial comment on this ticket.",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: statuses[i % statuses.length] === "resolved" || statuses[i % statuses.length] === "closed" ? new Date().toISOString() : undefined,
  }));
}

/**
 * Generate mock KPIs
 */
export function generateMockKPIs(count: number = 10): KPI[] {
  const kpis = [
    { name: "Call Quality Score", category: "Quality", unit: "score", target: 85 },
    { name: "Average Handle Time", category: "Efficiency", unit: "seconds", target: 300 },
    { name: "First Call Resolution", category: "Quality", unit: "percentage", target: 80 },
    { name: "Customer Satisfaction", category: "Quality", unit: "score", target: 90 },
    { name: "Calls Per Hour", category: "Productivity", unit: "count", target: 10 },
    { name: "Attendance Rate", category: "Attendance", unit: "percentage", target: 95 },
    { name: "Training Completion", category: "Development", unit: "percentage", target: 100 },
    { name: "Error Rate", category: "Quality", unit: "percentage", target: 5 },
    { name: "Schedule Adherence", category: "Efficiency", unit: "percentage", target: 95 },
    { name: "Sales Conversion", category: "Sales", unit: "percentage", target: 25 },
  ];

  return kpis.slice(0, count).map((kpi, i) => ({
    id: `kpi-${i + 1}`,
    name: kpi.name,
    description: `KPI for measuring ${kpi.name.toLowerCase()}`,
    category: kpi.category,
    targetValue: kpi.target,
    unit: kpi.unit,
    weight: 10 + (i % 3) * 5,
  }));
}

/**
 * Generate mock performance metrics
 */
export function generateMockPerformanceMetrics(count: number = 100): PerformanceMetric[] {
  const periods = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"];
  const trends: PerformanceMetric["trend"][] = ["improving", "stable", "declining"];

  return Array.from({ length: count }, (_, i) => {
    const targetValue = 80 + (i % 20);
    const actualValue = targetValue - 10 + Math.floor(Math.random() * 25);

    return {
      id: `metric-${i + 1}`,
      employeeId: `emp-${(i % 20) + 1}`,
      kpiId: `kpi-${(i % 10) + 1}`,
      period: periods[i % periods.length],
      actualValue,
      targetValue,
      score: Math.min(100, Math.round((actualValue / targetValue) * 100)),
      trend: trends[i % trends.length],
      createdAt: new Date(2024, (i % 4) * 3, 1).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate mock quality assessments
 */
export function generateMockQualityAssessments(count: number = 50): QualityAssessment[] {
  const assessmentTypes: QualityAssessment["assessmentType"][] = ["call_quality", "task_quality", "peer_review", "manager_review"];
  const criteriaNames = ["Communication", "Problem Solving", "Product Knowledge", "Professionalism", "Efficiency"];
  const skillGapOptions = ["communication", "technical-knowledge", "time-management", "customer-handling", "product-expertise"];
  const recommendationOptions = [
    "Complete Communication Skills course",
    "Shadow senior team member",
    "Review product documentation",
    "Attend customer service workshop",
    "Practice time management techniques",
  ];

  return Array.from({ length: count }, (_, i) => {
    const score = 60 + Math.floor(Math.random() * 40);
    const hasSkillGaps = score < 75;

    return {
      id: `assessment-${i + 1}`,
      employeeId: `emp-${(i % 20) + 1}`,
      assessorId: `emp-${(i % 5) + 1}`,
      assessmentType: assessmentTypes[i % assessmentTypes.length],
      score,
      criteria: criteriaNames.map((name, j) => ({
        name,
        score: 60 + Math.floor(Math.random() * 40),
        weight: 20,
        comments: j === 0 ? "Good performance in this area" : undefined,
      })),
      overallComments: score >= 80 ? "Excellent performance overall" : score >= 70 ? "Good performance with room for improvement" : "Needs improvement in several areas",
      skillGaps: hasSkillGaps ? [skillGapOptions[i % skillGapOptions.length]] : [],
      recommendations: hasSkillGaps ? [recommendationOptions[i % recommendationOptions.length]] : [],
      assessmentDate: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      createdAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate mock skill gaps
 */
export function generateMockSkillGaps(count: number = 35): SkillGap[] {
  const skills = [
    "Communication",
    "Technical Knowledge",
    "Time Management",
    "Customer Handling",
    "Product Expertise",
    "Problem Solving",
    "Team Collaboration",
    "Leadership",
    "Data Analysis",
    "Presentation Skills",
  ];
  const priorities: SkillGap["priority"][] = ["low", "medium", "high"];

  return Array.from({ length: count }, (_, i) => {
    const currentLevel = 40 + Math.floor(Math.random() * 30);
    const requiredLevel = 70 + Math.floor(Math.random() * 20);

    return {
      id: `skill-gap-${i + 1}`,
      employeeId: `emp-${(i % 20) + 1}`,
      skillName: skills[i % skills.length],
      currentLevel,
      requiredLevel,
      gap: requiredLevel - currentLevel,
      priority: priorities[i % priorities.length],
      recommendedCourseIds: [`course-${(i % 15) + 1}`],
      identifiedAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      resolvedAt: i % 3 === 0 ? new Date().toISOString() : undefined,
    };
  });
}

/**
 * All mock data generators combined
 */
export const mockDataGenerators = {
  employees: generateMockEmployees,
  hiringRequisitions: generateMockHiringRequisitions,
  courses: generateMockCourses,
  enrollments: generateMockEnrollments,
  shifts: generateMockShifts,
  attendance: generateMockAttendance,
  tickets: generateMockTickets,
  kpis: generateMockKPIs,
  performanceMetrics: generateMockPerformanceMetrics,
  qualityAssessments: generateMockQualityAssessments,
  skillGaps: generateMockSkillGaps,
};

