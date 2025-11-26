"use client";

import {
  ServiceCard,
  MetricsWidget,
  RecentTicketsWidget,
} from "@/components";
import { CustomLineChart, CustomBarChart, CustomPieChart, CustomAreaChart } from "@/components/charts";
import { useStore, useTickets, useEmployees, useHiringRequisitions, useCourses, useEnrollments, usePerformanceMetrics, useQualityAssessments, useShifts, useAttendance } from "@/lib/storage";
import { Divider, Card, CardBody, CardHeader } from "@heroui/react";
import { useMemo } from "react";

export default function AnalyticsPage() {
  const initialized = useStore((state) => state.initialized);
  const tickets = useTickets();
  const employees = useEmployees();
  const requisitions = useHiringRequisitions();
  const courses = useCourses();
  const enrollments = useEnrollments();
  const performanceMetrics = usePerformanceMetrics();
  const assessments = useQualityAssessments();
  const shifts = useShifts();
  const attendance = useAttendance();

  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  );
  const activeEmployees = employees.filter((e) => e.status === "active");
  const pendingRequisitions = requisitions.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  );

  // Chart data: Tickets by status
  const ticketsByStatus = useMemo(() => {
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  // Chart data: Employees by department
  const employeesByDepartment = useMemo(() => {
    const deptCounts = activeEmployees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeEmployees]);

  // Chart data: Performance trends (last 6 months)
  const performanceTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthMetrics = performanceMetrics.filter((m) => {
        const periodMonth = parseInt(m.period.split("-")[1] || "1");
        return periodMonth === index + 1;
      });
      const avgScore = monthMetrics.length > 0
        ? Math.round(monthMetrics.reduce((sum, m) => sum + m.score, 0) / monthMetrics.length)
        : 75 + Math.floor(Math.random() * 10);
      return { name: month, Score: avgScore, Target: 85 };
    });
  }, [performanceMetrics]);

  // Chart data: Ticket trends
  const ticketTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthTickets = tickets.filter((t) => {
        const ticketDate = new Date(t.createdAt);
        return ticketDate.getMonth() === index;
      });
      return {
        name: month,
        Created: monthTickets.length,
        Resolved: monthTickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      };
    });
  }, [tickets]);

  // Chart data: Course enrollments by category
  const enrollmentsByCategory = useMemo(() => {
    const categoryCounts = enrollments.reduce((acc, enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId);
      if (course) {
        acc[course.category] = (acc[course.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [enrollments, courses]);

  // Chart data: Assessment scores distribution
  const assessmentScores = useMemo(() => {
    const ranges = [
      { name: "60-70", min: 60, max: 70 },
      { name: "70-80", min: 70, max: 80 },
      { name: "80-90", min: 80, max: 90 },
      { name: "90-100", min: 90, max: 100 },
    ];
    return ranges.map((range) => ({
      name: range.name,
      value: assessments.filter((a) => a.score >= range.min && a.score < range.max).length,
    }));
  }, [assessments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-default-500 mt-1">
            Comprehensive analytics and insights for all organizational services
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsWidget
        title="Overview"
        metrics={[
          { label: "Active Employees", value: activeEmployees.length, change: 5 },
          { label: "Open Tickets", value: openTickets.length, change: -12 },
          { label: "Pending Requisitions", value: pendingRequisitions.length },
          { label: "Total Tickets", value: tickets.length },
        ]}
      />

      {/* Service Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <ServiceCard
            title="H2R"
            description="HR Portal for employee services"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            href="/services/h2r"
            stats={[
              { label: "Employees", value: activeEmployees.length },
              { label: "Requisitions", value: pendingRequisitions.length },
            ]}
            color="primary"
          />
          <ServiceCard
            title="LMS"
            description="Learning Management System"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            href="/services/lms"
            stats={[
              { label: "Courses", value: courses.length },
              { label: "Enrollments", value: enrollments.length },
            ]}
            color="secondary"
          />
          <ServiceCard
            title="WFM"
            description="Workforce Management"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            href="/services/wfm"
            stats={[
              { label: "Shifts Today", value: 12 },
              { label: "Attendance", value: "95%", trend: "up" },
            ]}
            color="success"
          />
          <ServiceCard
            title="Ticketing"
            description="Project & IT Support"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
            href="/services/ticketing"
            stats={[
              { label: "Open", value: openTickets.length },
              { label: "Critical", value: tickets.filter((t) => t.priority === "critical").length },
            ]}
            color="warning"
          />
          <ServiceCard
            title="Performance"
            description="Performance Management"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            href="/services/performance"
            stats={[
              { label: "Avg Score", value: "82%", trend: "up" },
              { label: "Skill Gaps", value: 15 },
            ]}
            color="danger"
          />
        </div>
      </div>

      <Divider />

      {/* Charts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Analytics & Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader className="pb-0 pt-4">
              <h3 className="text-lg font-semibold">Performance Trends</h3>
            </CardHeader>
            <CardBody>
              <CustomLineChart
                data={performanceTrend}
                dataKeys={["Score", "Target"]}
                colors={["#006FEE", "#F31260"]}
                height={250}
              />
            </CardBody>
          </Card>

          {/* Ticket Trends */}
          <Card>
            <CardHeader className="pb-0 pt-4">
              <h3 className="text-lg font-semibold">Ticket Trends</h3>
            </CardHeader>
            <CardBody>
              <CustomAreaChart
                data={ticketTrend}
                dataKeys={["Created", "Resolved"]}
                colors={["#006FEE", "#17C964"]}
                height={250}
              />
            </CardBody>
          </Card>

          {/* Employees by Department */}
          <Card>
            <CardHeader className="pb-0 pt-4">
              <h3 className="text-lg font-semibold">Employees by Department</h3>
            </CardHeader>
            <CardBody>
              <CustomBarChart
                data={employeesByDepartment}
                dataKeys={["value"]}
                colors={["#006FEE"]}
                height={250}
                horizontal={true}
                showLegend={false}
              />
            </CardBody>
          </Card>

          {/* Tickets by Status */}
          <Card>
            <CardHeader className="pb-0 pt-4">
              <h3 className="text-lg font-semibold">Tickets by Status</h3>
            </CardHeader>
            <CardBody>
              <CustomPieChart
                data={ticketsByStatus}
                height={250}
              />
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Enrollments by Category */}
          <Card>
            <CardHeader className="pb-0 pt-4">
              <h3 className="text-lg font-semibold">Course Enrollments by Category</h3>
            </CardHeader>
            <CardBody>
              <CustomBarChart
                data={enrollmentsByCategory}
                dataKeys={["value"]}
                colors={["#7828C8"]}
                height={250}
                showLegend={false}
              />
            </CardBody>
          </Card>

          {/* Assessment Score Distribution */}
          <Card>
            <CardHeader className="pb-0 pt-4">
              <h3 className="text-lg font-semibold">Assessment Score Distribution</h3>
            </CardHeader>
            <CardBody>
              <CustomPieChart
                data={assessmentScores}
                height={250}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <Divider />

      {/* Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <RecentTicketsWidget tickets={tickets} />
      </div>
    </div>
  );
}

