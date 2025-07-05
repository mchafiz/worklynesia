-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'leave', 'sick', 'wfh');

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendance_date" TIMESTAMP(3) NOT NULL,
    "check_in_at" TIMESTAMP(3),
    "check_out_at" TIMESTAMP(3),
    "location_in" TEXT,
    "location_out" TEXT,
    "location_in_lat" DOUBLE PRECISION,
    "location_in_lng" DOUBLE PRECISION,
    "location_out_lat" DOUBLE PRECISION,
    "location_out_lng" DOUBLE PRECISION,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'wfh',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendances_userId_attendance_date_idx" ON "attendances"("userId", "attendance_date");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
