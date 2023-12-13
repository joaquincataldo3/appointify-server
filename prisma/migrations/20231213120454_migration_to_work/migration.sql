-- CreateTable
CREATE TABLE "User_Role" (
    "id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "User_Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_role_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "year_days" (
    "id" SERIAL NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "year_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "appt_hour_start" TIMESTAMP(3) NOT NULL,
    "appt_hour_end" TIMESTAMP(3) NOT NULL,
    "client_id" INTEGER NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "year_day_id" INTEGER NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_blacklist" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "tokens_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_work_days" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "break_time_start" TIMESTAMP(3) NOT NULL,
    "break_time_stop" TIMESTAMP(3) NOT NULL,
    "appt_interval" INTEGER NOT NULL,
    "appt_duration" INTEGER NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "day_of_the_week_id" INTEGER NOT NULL,

    CONSTRAINT "professional_work_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_days" (
    "id" SERIAL NOT NULL,
    "day_name" TEXT NOT NULL,

    CONSTRAINT "week_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "User_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_year_day_id_fkey" FOREIGN KEY ("year_day_id") REFERENCES "year_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_blacklist" ADD CONSTRAINT "tokens_blacklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_work_days" ADD CONSTRAINT "professional_work_days_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_work_days" ADD CONSTRAINT "professional_work_days_day_of_the_week_id_fkey" FOREIGN KEY ("day_of_the_week_id") REFERENCES "week_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
