-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "barberId" INTEGER NOT NULL,
    "barberServiceId" INTEGER NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberServiceId_fkey" FOREIGN KEY ("barberServiceId") REFERENCES "BarberService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
