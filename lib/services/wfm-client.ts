import { Shift, Attendance, ServiceResponse } from "@/types/services";
import { BaseServiceClient } from "./base-client";
import { getDataSourceConfig } from "@/lib/data-sources/config";
import { generateMockShifts, generateMockAttendance } from "@/lib/data-sources/mock-providers";

/**
 * WFM Shift Client
 * Handles shift scheduling and management
 */
export class WFMShiftClient extends BaseServiceClient<Shift> {
  constructor() {
    super(getDataSourceConfig("wfm"), generateMockShifts(50));
  }

  /**
   * Get shifts by employee
   */
  async getByEmployee(employeeId: string): Promise<ServiceResponse<Shift[]>> {
    return this.getWhere({ employeeId });
  }

  /**
   * Get shifts by date
   */
  async getByDate(date: string): Promise<ServiceResponse<Shift[]>> {
    return this.getWhere({ date });
  }

  /**
   * Get shifts by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ServiceResponse<Shift[]>> {
    const result = await this.getAll();
    const filtered = result.data.filter(
      (shift) => shift.date >= startDate && shift.date <= endDate
    );
    return { success: true, data: filtered };
  }

  /**
   * Get shifts by status
   */
  async getByStatus(status: Shift["status"]): Promise<ServiceResponse<Shift[]>> {
    return this.getWhere({ status });
  }

  /**
   * Schedule a new shift
   */
  async scheduleShift(
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string,
    type: Shift["type"] = "regular"
  ): Promise<ServiceResponse<Shift>> {
    const shift: Partial<Shift> = {
      id: this.generateId(),
      employeeId,
      date,
      startTime,
      endTime,
      type,
      status: "scheduled",
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };
    return this.create(shift);
  }

  /**
   * Complete a shift
   */
  async completeShift(shiftId: string): Promise<ServiceResponse<Shift>> {
    return this.update(shiftId, { status: "completed" });
  }

  /**
   * Cancel a shift
   */
  async cancelShift(shiftId: string): Promise<ServiceResponse<Shift>> {
    return this.update(shiftId, { status: "cancelled" });
  }

  /**
   * Mark shift as no-show
   */
  async markNoShow(shiftId: string): Promise<ServiceResponse<Shift>> {
    return this.update(shiftId, { status: "no_show" });
  }

  /**
   * Get upcoming shifts for employee
   */
  async getUpcomingShifts(employeeId: string): Promise<ServiceResponse<Shift[]>> {
    const today = new Date().toISOString().split("T")[0];
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const upcoming = result.data.filter(
      (shift) => shift.date >= today && shift.status === "scheduled"
    );
    return { success: true, data: upcoming };
  }
}

/**
 * WFM Attendance Client
 * Handles attendance tracking
 */
export class WFMAttendanceClient extends BaseServiceClient<Attendance> {
  constructor() {
    super(
      { ...getDataSourceConfig("wfm"), id: "wfm-attendance" },
      generateMockAttendance(50)
    );
  }

  /**
   * Get attendance by employee
   */
  async getByEmployee(employeeId: string): Promise<ServiceResponse<Attendance[]>> {
    return this.getWhere({ employeeId });
  }

  /**
   * Get attendance by date
   */
  async getByDate(date: string): Promise<ServiceResponse<Attendance[]>> {
    return this.getWhere({ date });
  }

  /**
   * Get attendance by date range
   */
  async getByDateRange(employeeId: string, startDate: string, endDate: string): Promise<ServiceResponse<Attendance[]>> {
    const result = await this.getByEmployee(employeeId);
    if (!result.success || !result.data) {
      return result;
    }
    const filtered = result.data.filter(
      (attendance) => attendance.date >= startDate && attendance.date <= endDate
    );
    return { success: true, data: filtered };
  }

  /**
   * Record check-in
   */
  async checkIn(employeeId: string): Promise<ServiceResponse<Attendance>> {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();
    
    // Check if attendance record exists for today
    const existing = await this.getWhere({ employeeId, date: today });
    if (existing.success && existing.data && existing.data.length > 0) {
      return this.update(existing.data[0].id, { checkIn: now, status: "present" });
    }

    const attendance: Partial<Attendance> = {
      id: this.generateId(),
      employeeId,
      date: today,
      checkIn: now,
      status: "present",
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };
    return this.create(attendance);
  }

  /**
   * Record check-out
   */
  async checkOut(employeeId: string): Promise<ServiceResponse<Attendance>> {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    const existing = await this.getWhere({ employeeId, date: today });
    if (!existing.success || !existing.data || existing.data.length === 0) {
      return { success: false, error: "No check-in found for today" };
    }

    const attendance = existing.data[0];
    const checkInTime = new Date(attendance.checkIn!).getTime();
    const checkOutTime = new Date(now).getTime();
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    return this.update(attendance.id, {
      checkOut: now,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
    });
  }

  /**
   * Mark as on leave
   */
  async markOnLeave(employeeId: string, date: string): Promise<ServiceResponse<Attendance>> {
    const attendance: Partial<Attendance> = {
      id: this.generateId(),
      employeeId,
      date,
      status: "on_leave",
      hoursWorked: 0,
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };
    return this.create(attendance);
  }

  /**
   * Get attendance rate for employee
   */
  async getAttendanceRate(employeeId: string, startDate: string, endDate: string): Promise<number> {
    const result = await this.getByDateRange(employeeId, startDate, endDate);
    if (!result.success || !result.data || result.data.length === 0) {
      return 0;
    }

    const presentDays = result.data.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    return (presentDays / result.data.length) * 100;
  }
}

// Singleton instances
let shiftClientInstance: WFMShiftClient | null = null;
let attendanceClientInstance: WFMAttendanceClient | null = null;

export function getWFMShiftClient(): WFMShiftClient {
  if (!shiftClientInstance) {
    shiftClientInstance = new WFMShiftClient();
  }
  return shiftClientInstance;
}

export function getWFMAttendanceClient(): WFMAttendanceClient {
  if (!attendanceClientInstance) {
    attendanceClientInstance = new WFMAttendanceClient();
  }
  return attendanceClientInstance;
}

