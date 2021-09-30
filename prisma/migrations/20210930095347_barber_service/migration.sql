-- CreateTable
CREATE TABLE "BarberService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "BarberService_pkey" PRIMARY KEY ("id")
);
