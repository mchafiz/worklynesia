import { AttendanceStatus } from "@prisma/client";

export interface AttendanceIn {
  id: string;
  userId: string;
  date: Date;
  checkInAt: Date;
  locationIn: string;
  locationInLat: string;
  locationInLng: string;
  status: AttendanceStatus;
}

export interface AttendanceOut {
  id: string;
  userId: string;
  date: Date;
  checkOutAt: Date;
  locationOut: string;
  locationOutLat: string;
  locationOutLng: string;
  status: AttendanceStatus;
}
