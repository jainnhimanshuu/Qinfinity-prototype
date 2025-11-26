"use client";

import { useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
} from "@heroui/react";
import { CustomLineChart, CustomBarChart, CustomPieChart } from "@/components/charts";
import { useStore, useQualityAssessments, useSkillGaps, usePerformanceMetrics } from "@/lib/storage";

export default function PerformancePage() {
  const initialized = useStore((state) => state.initialized);
  const assessments = useQualityAssessments();
  const skillGaps = useSkillGaps();
  const performanceMetrics = usePerformanceMetrics();

  useEffect(() => {
    if (!initialized) {
      useStore.getState().initialize();
    }
  }, [initialized]);

  const avgScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
    : 0;

  const unresolvedGaps = skillGaps.filter((g) => !g.resolvedAt).length;
  const highPriorityGaps = skillGaps.filter((g) => g.priority === "high" && !g.resolvedAt).length;

  const getScoreColor = (score: number): "success" | "warning" | "danger" => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  // Chart data: Assessment scores over time
  const assessmentTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthAssessments = assessments.filter((a) => {
        const assessmentDate = new Date(a.assessmentDate);
        return assessmentDate.getMonth() === index;
      });
      const avgScore = monthAssessments.length > 0
        ? Math.round(monthAssessments.reduce((sum, a) => sum + a.score, 0) / monthAssessments.length)
        : 75 + Math.floor(Math.random() * 10);
      return { name: month, "Avg Score": avgScore };
    });
  }, [assessments]);

  // Chart data: Skill gaps by priority
  const skillGapsByPriority = useMemo(() => {
    const priorityCounts = skillGaps.reduce((acc, gap) => {
      if (!gap.resolvedAt) {
        acc[gap.priority] = (acc[gap.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(priorityCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [skillGaps]);

  // Chart data: Assessment scores distribution
  const assessmentDistribution = useMemo(() => {
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

  // Chart data: Skill gaps by skill name
  const skillGapsBySkill = useMemo(() => {
    const skillCounts = skillGaps.filter((g) => !g.resolvedAt).reduce((acc, gap) => {
      acc[gap.skillName] = (acc[gap.skillName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [skillGaps]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Management</h1>
        <p className="text-default-500 mt-1">
          Quality assessments, KPIs, and skill gap analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <p className={`text-3xl font-bold text-${getScoreColor(avgScore)}`}>{avgScore}%</p>
            <p className="text-sm text-default-500">Avg Quality Score</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold">{assessments.length}</p>
            <p className="text-sm text-default-500">Assessments</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-warning">{unresolvedGaps}</p>
            <p className="text-sm text-default-500">Skill Gaps</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-danger">{highPriorityGaps}</p>
            <p className="text-sm text-default-500">High Priority</p>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-0 pt-4">
            <h3 className="text-lg font-semibold">Assessment Score Trend</h3>
          </CardHeader>
          <CardBody>
            <CustomLineChart
              data={assessmentTrend}
              dataKeys={["Avg Score"]}
              colors={["#006FEE"]}
              height={250}
              showLegend={false}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-4">
            <h3 className="text-lg font-semibold">Assessment Score Distribution</h3>
          </CardHeader>
          <CardBody>
            <CustomPieChart
              data={assessmentDistribution}
              height={250}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-4">
            <h3 className="text-lg font-semibold">Skill Gaps by Priority</h3>
          </CardHeader>
          <CardBody>
            <CustomBarChart
              data={skillGapsByPriority}
              dataKeys={["value"]}
              colors={["#F31260"]}
              height={250}
              showLegend={false}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-4">
            <h3 className="text-lg font-semibold">Top Skill Gaps</h3>
          </CardHeader>
          <CardBody>
            <CustomBarChart
              data={skillGapsBySkill}
              dataKeys={["value"]}
              colors={["#F5A524"]}
              height={250}
              horizontal={true}
              showLegend={false}
            />
          </CardBody>
        </Card>
      </div>

      <Tabs aria-label="Performance tabs">
        <Tab key="assessments" title={`Assessments (${assessments.length})`}>
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Quality Assessments</h3>
            </CardHeader>
            <CardBody>
              <Table aria-label="Assessments table">
                <TableHeader>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>SCORE</TableColumn>
                  <TableColumn>SKILL GAPS</TableColumn>
                  <TableColumn>DATE</TableColumn>
                </TableHeader>
                <TableBody>
                  {assessments.slice(0, 10).map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {assessment.assessmentType.replace("_", " ")}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{assessment.employeeId}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={assessment.score}
                            color={getScoreColor(assessment.score)}
                            size="sm"
                            className="max-w-20"
                          />
                          <span className="text-sm font-medium">{assessment.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assessment.skillGaps.length > 0 ? (
                          <div className="flex gap-1">
                            {assessment.skillGaps.slice(0, 2).map((gap) => (
                              <Chip key={gap} size="sm" color="warning" variant="flat">
                                {gap}
                              </Chip>
                            ))}
                            {assessment.skillGaps.length > 2 && (
                              <Chip size="sm" variant="flat">
                                +{assessment.skillGaps.length - 2}
                              </Chip>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-default-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-500">
                          {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="skill-gaps" title={`Skill Gaps (${skillGaps.length})`}>
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Identified Skill Gaps</h3>
            </CardHeader>
            <CardBody>
              <Table aria-label="Skill gaps table">
                <TableHeader>
                  <TableColumn>SKILL</TableColumn>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>GAP</TableColumn>
                  <TableColumn>PRIORITY</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>COURSES</TableColumn>
                </TableHeader>
                <TableBody>
                  {skillGaps.map((gap) => (
                    <TableRow key={gap.id}>
                      <TableCell>
                        <span className="font-medium">{gap.skillName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{gap.employeeId}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={gap.currentLevel}
                              maxValue={gap.requiredLevel}
                              color="warning"
                              size="sm"
                              className="max-w-20"
                            />
                          </div>
                          <span className="text-xs text-default-400">
                            {gap.currentLevel}/{gap.requiredLevel} (Gap: {gap.gap})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            gap.priority === "high"
                              ? "danger"
                              : gap.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                          variant="flat"
                        >
                          {gap.priority}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={gap.resolvedAt ? "success" : "warning"}
                          variant="dot"
                        >
                          {gap.resolvedAt ? "Resolved" : "Open"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {gap.recommendedCourseIds.length} recommended
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

