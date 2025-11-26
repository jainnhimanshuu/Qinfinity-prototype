"use client";

import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Progress,
  Tabs,
  Tab,
} from "@heroui/react";
import { useStore, useCourses, useEnrollments } from "@/lib/storage";

export default function LMSPage() {
  const initialized = useStore((state) => state.initialized);
  const courses = useCourses();
  const enrollments = useEnrollments();

  useEffect(() => {
    if (!initialized) {
      useStore.getState().initialize();
    }
  }, [initialized]);

  const levelColors: Record<string, "default" | "primary" | "success" | "warning"> = {
    beginner: "success",
    intermediate: "primary",
    advanced: "warning",
  };

  const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
  const inProgressEnrollments = enrollments.filter((e) => e.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Learning Management System</h1>
          <p className="text-default-500 mt-1">
            Courses, training, and skill development
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-primary">{courses.length}</p>
            <p className="text-sm text-default-500">Total Courses</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-warning">{inProgressEnrollments}</p>
            <p className="text-sm text-default-500">In Progress</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-success">{completedEnrollments}</p>
            <p className="text-sm text-default-500">Completed</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold">{enrollments.length}</p>
            <p className="text-sm text-default-500">Total Enrollments</p>
          </CardBody>
        </Card>
      </div>

      <Tabs aria-label="LMS tabs">
        <Tab key="courses" title={`Courses (${courses.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex justify-between">
                  <div className="flex flex-col">
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-xs text-default-400">{course.category}</p>
                  </div>
                  <Chip size="sm" color={levelColors[course.level]} variant="flat">
                    {course.level}
                  </Chip>
                </CardHeader>
                <CardBody className="py-2">
                  <p className="text-sm text-default-500 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Chip size="sm" variant="flat">
                      {course.duration} min
                    </Chip>
                    <Chip size="sm" variant="flat">
                      {course.modules.length} modules
                    </Chip>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.skillTags.slice(0, 3).map((tag) => (
                      <Chip key={tag} size="sm" variant="dot" color="primary">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </CardBody>
                <CardFooter>
                  <Button color="primary" variant="flat" className="w-full">
                    Enroll Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Tab>

        <Tab key="enrollments" title={`My Enrollments (${enrollments.length})`}>
          <div className="space-y-4 mt-4">
            {enrollments.slice(0, 10).map((enrollment) => {
              const course = courses.find((c) => c.id === enrollment.courseId);
              return (
                <Card key={enrollment.id}>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {course?.title || "Unknown Course"}
                        </p>
                        <p className="text-sm text-default-500">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress
                            value={enrollment.progress}
                            color={enrollment.status === "completed" ? "success" : "primary"}
                            size="sm"
                          />
                          <p className="text-xs text-center mt-1">{enrollment.progress}%</p>
                        </div>
                        <Chip
                          color={
                            enrollment.status === "completed"
                              ? "success"
                              : enrollment.status === "in_progress"
                              ? "primary"
                              : "default"
                          }
                          variant="flat"
                        >
                          {enrollment.status.replace("_", " ")}
                        </Chip>
                        {enrollment.score && (
                          <Chip color="success" variant="flat">
                            Score: {enrollment.score}%
                          </Chip>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

