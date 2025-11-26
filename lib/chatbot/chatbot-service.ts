import {
  Employee,
  HiringRequisition,
  Course,
  CourseEnrollment,
  Ticket,
  PerformanceMetric,
  QualityAssessment,
  SkillGap,
  KPI,
  Shift,
  Attendance,
} from "@/types/services";
import { useStore } from "@/lib/storage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  query: string;
  category: string;
}

/**
 * Chatbot service that provides AI-powered responses based on application data
 */
export class ChatbotService {
  private getStore() {
    return useStore.getState();
  }

  /**
   * Process user query and generate response
   */
  async processQuery(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase().trim();

    // Quick responses for greetings
    if (this.isGreeting(lowerQuery)) {
      return this.getGreetingResponse();
    }

    // Employee queries
    if (this.matchesPattern(lowerQuery, ["employee", "staff", "people", "team member"])) {
      return this.handleEmployeeQuery(lowerQuery);
    }

    // Ticket queries
    if (this.matchesPattern(lowerQuery, ["ticket", "issue", "support", "task"])) {
      return this.handleTicketQuery(lowerQuery);
    }

    // Hiring requisition queries
    if (this.matchesPattern(lowerQuery, ["requisition", "hiring", "recruitment", "open position"])) {
      return this.handleRequisitionQuery(lowerQuery);
    }

    // Course/LMS queries
    if (this.matchesPattern(lowerQuery, ["course", "training", "learning", "lms", "enrollment"])) {
      return this.handleCourseQuery(lowerQuery);
    }

    // Performance queries
    if (this.matchesPattern(lowerQuery, ["performance", "kpi", "metric", "assessment", "quality"])) {
      return this.handlePerformanceQuery(lowerQuery);
    }

    // WFM queries
    if (this.matchesPattern(lowerQuery, ["shift", "attendance", "schedule", "wfm"])) {
      return this.handleWFMQuery(lowerQuery);
    }

    // Dashboard/overview queries
    if (this.matchesPattern(lowerQuery, ["dashboard", "overview", "summary", "statistics", "stats"])) {
      return this.handleDashboardQuery();
    }

    // Help queries
    if (this.matchesPattern(lowerQuery, ["help", "what can", "how to", "guide"])) {
      return this.getHelpResponse();
    }

    // Default response
    return this.getDefaultResponse();
  }

  private isGreeting(query: string): boolean {
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
    return greetings.some((g) => query.startsWith(g));
  }

  private matchesPattern(query: string, patterns: string[]): boolean {
    return patterns.some((pattern) => query.includes(pattern));
  }

  private getGreetingResponse(): string {
    return `Hello! I'm your Qinfinity AI assistant. I can help you with information about:
• Employees and team members
• Tickets and support issues
• Hiring requisitions
• Courses and training
• Performance metrics and KPIs
• Shifts and attendance
• Dashboard statistics

What would you like to know?`;
  }

  private handleEmployeeQuery(query: string): string {
    const store = this.getStore();
    const employees = Array.from(store.employees.values());
    const activeEmployees = employees.filter((e) => e.status === "active");

    if (this.matchesPattern(query, ["count", "how many", "total", "number"])) {
      return `There are **${employees.length}** total employees in the system, with **${activeEmployees.length}** currently active.`;
    }

    if (this.matchesPattern(query, ["list", "show", "all"])) {
      const names = activeEmployees.slice(0, 5).map((e) => `${e.firstName} ${e.lastName}`).join(", ");
      const more = activeEmployees.length > 5 ? ` and ${activeEmployees.length - 5} more` : "";
      return `Here are some active employees: ${names}${more}. You can view the full list in the H2R Portal.`;
    }

    if (this.matchesPattern(query, ["department", "dept"])) {
      const departments = new Set(activeEmployees.map((e) => e.department));
      return `Employees are spread across **${departments.size}** departments: ${Array.from(departments).slice(0, 5).join(", ")}.`;
    }

    return `I found **${activeEmployees.length}** active employees in the system. Would you like to know more about a specific employee or department?`;
  }

  private handleTicketQuery(query: string): string {
    const store = this.getStore();
    const tickets = Array.from(store.tickets.values());
    const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
    const criticalTickets = tickets.filter((t) => t.priority === "critical");

    if (this.matchesPattern(query, ["open", "pending", "active"])) {
      return `There are **${openTickets.length}** open tickets currently in the system.`;
    }

    if (this.matchesPattern(query, ["critical", "urgent", "high priority"])) {
      return `There are **${criticalTickets.length}** critical priority tickets that need immediate attention.`;
    }

    if (this.matchesPattern(query, ["count", "how many", "total"])) {
      return `Total tickets in the system: **${tickets.length}** (${openTickets.length} open, ${tickets.length - openTickets.length} closed).`;
    }

    if (this.matchesPattern(query, ["category", "type"])) {
      const categories = new Set(tickets.map((t) => t.category));
      return `Tickets are categorized into: ${Array.from(categories).join(", ")}.`;
    }

    return `I found **${tickets.length}** total tickets. **${openTickets.length}** are currently open. Would you like details on a specific ticket?`;
  }

  private handleRequisitionQuery(query: string): string {
    const store = this.getStore();
    const requisitions = Array.from(store.hiringRequisitions.values());
    const pendingRequisitions = requisitions.filter(
      (r) => r.status === "pending" || r.status === "in_progress"
    );

    if (this.matchesPattern(query, ["pending", "open", "active"])) {
      return `There are **${pendingRequisitions.length}** pending hiring requisitions.`;
    }

    if (this.matchesPattern(query, ["count", "how many", "total"])) {
      return `Total hiring requisitions: **${requisitions.length}** (${pendingRequisitions.length} pending).`;
    }

    if (this.matchesPattern(query, ["department", "dept"])) {
      const departments = new Set(requisitions.map((r) => r.department));
      return `Requisitions are open in **${departments.size}** departments: ${Array.from(departments).join(", ")}.`;
    }

    return `I found **${requisitions.length}** hiring requisitions, with **${pendingRequisitions.length}** currently pending. Check the H2R Portal for details.`;
  }

  private handleCourseQuery(query: string): string {
    const store = this.getStore();
    const courses = Array.from(store.courses.values());
    const enrollments = Array.from(store.enrollments.values());
    const activeEnrollments = enrollments.filter((e) => e.status === "in_progress");

    if (this.matchesPattern(query, ["course", "available"])) {
      return `There are **${courses.length}** courses available in the LMS.`;
    }

    if (this.matchesPattern(query, ["enrollment", "enrolled", "student"])) {
      return `Total enrollments: **${enrollments.length}** (${activeEnrollments.length} currently in progress).`;
    }

    if (this.matchesPattern(query, ["category", "type"])) {
      const categories = new Set(courses.map((c) => c.category));
      return `Courses are available in: ${Array.from(categories).join(", ")}.`;
    }

    return `The LMS has **${courses.length}** courses with **${enrollments.length}** total enrollments. Visit the LMS page to browse courses.`;
  }

  private handlePerformanceQuery(query: string): string {
    const store = this.getStore();
    const assessments = Array.from(store.qualityAssessments.values());
    const skillGaps = Array.from(store.skillGaps.values());
    const kpis = Array.from(store.kpis.values());
    const metrics = Array.from(store.performanceMetrics.values());

    if (this.matchesPattern(query, ["assessment", "quality", "cqa"])) {
      const avgScore = assessments.length > 0
        ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
        : 0;
      return `There are **${assessments.length}** quality assessments. Average score: **${avgScore}%**.`;
    }

    if (this.matchesPattern(query, ["skill gap", "gap", "training need"])) {
      const activeGaps = skillGaps.filter((g) => !g.resolvedAt);
      return `I found **${skillGaps.length}** skill gaps identified, with **${activeGaps.length}** currently open and requiring attention.`;
    }

    if (this.matchesPattern(query, ["kpi", "metric"])) {
      return `There are **${kpis.length}** KPIs being tracked and **${metrics.length}** performance metrics recorded.`;
    }

    return `Performance data: **${assessments.length}** assessments, **${skillGaps.length}** skill gaps, **${kpis.length}** KPIs. Check the Performance Management page for details.`;
  }

  private handleWFMQuery(query: string): string {
    const store = this.getStore();
    const shifts = Array.from(store.shifts.values());
    const attendance = Array.from(store.attendance.values());
    const today = new Date().toISOString().split("T")[0];
    const todayShifts = shifts.filter((s) => s.date === today);

    if (this.matchesPattern(query, ["shift", "today", "schedule"])) {
      return `There are **${todayShifts.length}** shifts scheduled for today.`;
    }

    if (this.matchesPattern(query, ["attendance", "present"])) {
      const todayAttendance = attendance.filter((a) => a.date === today);
      return `Today's attendance: **${todayAttendance.length}** records.`;
    }

    if (this.matchesPattern(query, ["count", "how many", "total"])) {
      return `Total shifts: **${shifts.length}**, Attendance records: **${attendance.length}**.`;
    }

    return `WFM data: **${shifts.length}** shifts scheduled, **${attendance.length}** attendance records. Visit the WFM page for scheduling details.`;
  }

  private handleDashboardQuery(): string {
    const store = this.getStore();
    const employees = Array.from(store.employees.values());
    const activeEmployees = employees.filter((e) => e.status === "active");
    const tickets = Array.from(store.tickets.values());
    const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
    const requisitions = Array.from(store.hiringRequisitions.values());
    const pendingRequisitions = requisitions.filter(
      (r) => r.status === "pending" || r.status === "in_progress"
    );
    const courses = Array.from(store.courses.values());

    return `**Dashboard Overview:**
• **${activeEmployees.length}** Active Employees
• **${openTickets.length}** Open Tickets
• **${pendingRequisitions.length}** Pending Requisitions
• **${courses.length}** Available Courses

Everything looks good! You can explore each service from the dashboard.`;
  }

  private getHelpResponse(): string {
    return `I can help you with:

**📊 Dashboard & Statistics**
• "Show me dashboard overview"
• "How many employees are there?"

**👥 Employees & H2R**
• "List active employees"
• "Show pending requisitions"

**🎫 Tickets**
• "How many open tickets?"
• "Show critical tickets"

**📚 Learning & Courses**
• "Available courses"
• "Current enrollments"

**📈 Performance**
• "Quality assessments"
• "Skill gaps"

**⏰ Workforce Management**
• "Today's shifts"
• "Attendance records"

Try asking me anything about your organization!`;
  }

  private getDefaultResponse(): string {
    return `I'm not sure I understand that question. I can help you with information about employees, tickets, requisitions, courses, performance metrics, and workforce management. 

Try asking:
• "Show me the dashboard overview"
• "How many open tickets are there?"
• "List active employees"
• Or use the quick action chips below!`;
  }
}

/**
 * Quick action chips for common queries
 */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "dashboard",
    label: "Dashboard Overview",
    query: "Show me the dashboard overview",
    category: "general",
  },
  {
    id: "employees-count",
    label: "Employee Count",
    query: "How many employees are there?",
    category: "h2r",
  },
  {
    id: "open-tickets",
    label: "Open Tickets",
    query: "How many open tickets are there?",
    category: "ticketing",
  },
  {
    id: "pending-req",
    label: "Pending Requisitions",
    query: "Show pending requisitions",
    category: "h2r",
  },
  {
    id: "courses",
    label: "Available Courses",
    query: "How many courses are available?",
    category: "lms",
  },
  {
    id: "performance",
    label: "Performance Metrics",
    query: "Show performance assessments",
    category: "performance",
  },
  {
    id: "today-shifts",
    label: "Today's Shifts",
    query: "How many shifts are scheduled today?",
    category: "wfm",
  },
  {
    id: "skill-gaps",
    label: "Skill Gaps",
    query: "Show skill gaps",
    category: "performance",
  },
];

