-- AlterTable
ALTER TABLE
  "Appointment"
ADD
  COLUMN "clientName" TEXT NOT NULL,
ADD
  COLUMN "clientPhoneNumber" TEXT NOT NULL;