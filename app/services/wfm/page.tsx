"use client";

import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
} from "@heroui/react";
import { useStore } from "@/lib/storage";
import { generateMockShifts, generateMockAttendance } from "@/lib/data-sources/mock-providers";

export default function WFMPage() {
  const initialized = useStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      useStore.getState().initialize();
    }
  }, [initialized]);

  const shifts = generateMockShifts(20);
  const attendance = generateMockAttendance(20);

  const scheduledShifts = shifts.filter((s) => s.status === "scheduled").length;
  const completedShifts = shifts.filter((s) => s.status === "completed").length;
  const presentToday = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter((a) => a.status === "present" || a.status === "late").length / attendance.length) * 100)
    : 0;

  const shiftStatusColors: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
    scheduled: "primary",
    completed: "success",
    cancelled: "danger",
    no_show: "warning",
  };

  const attendanceStatusColors: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
    present: "success",
    absent: "danger",
    late: "warning",
    half_day: "warning",
    on_leave: "default",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workforce Management</h1>
        <p className="text-default-500 mt-1">
          Shift scheduling and attendance tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-primary">{scheduledShifts}</p>
            <p className="text-sm text-default-500">Scheduled Shifts</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-success">{completedShifts}</p>
            <p className="text-sm text-default-500">Completed</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold">{presentToday}</p>
            <p className="text-sm text-default-500">Present Today</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-success">{attendanceRate}%</p>
            <p className="text-sm text-default-500">Attendance Rate</p>
          </CardBody>
        </Card>
      </div>

      <Tabs aria-label="WFM tabs">
        <Tab key="shifts" title={`Shifts (${shifts.length})`}>
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Shift Schedule</h3>
            </CardHeader>
            <CardBody>
              <Table aria-label="Shifts table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>TIME</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                </TableHeader>
                <TableBody>
                  {shifts.slice(0, 10).map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <span className="text-sm">{shift.employeeId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{shift.date}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {shift.type}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color={shiftStatusColors[shift.status]} variant="flat">
                          {shift.status.replace("_", " ")}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="attendance" title={`Attendance (${attendance.length})`}>
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Attendance Records</h3>
            </CardHeader>
            <CardBody>
              <Table aria-label="Attendance table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>CHECK IN</TableColumn>
                  <TableColumn>CHECK OUT</TableColumn>
                  <TableColumn>HOURS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                </TableHeader>
                <TableBody>
                  {attendance.slice(0, 10).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <span className="text-sm">{record.employeeId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{record.date}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {record.hoursWorked ? `${record.hoursWorked}h` : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color={attendanceStatusColors[record.status]} variant="flat">
                          {record.status.replace("_", " ")}
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

