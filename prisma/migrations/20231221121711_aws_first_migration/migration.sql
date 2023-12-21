/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User_Role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `day_number` to the `week_days` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_client_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_year_day_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_user_role_id_fkey";

-- AlterTable
ALTER TABLE "week_days" ADD COLUMN     "day_number" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "User_Role";

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "appt_hour_start" TIMESTAMP(3) NOT NULL,
    "appt_hour_end" TIMESTAMP(3) NOT NULL,
    "client_id" INTEGER NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "year_day_id" INTEGER NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_year_day_id_fkey" FOREIGN KEY ("year_day_id") REFERENCES "year_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
