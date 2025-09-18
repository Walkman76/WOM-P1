/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT (now())::timestamp(0) without time zone,
    "updated_at" TIMESTAMP(6) DEFAULT (now())::timestamp(0) without time zone,
    "password" VARCHAR NOT NULL,
    "username" VARCHAR NOT NULL,

    CONSTRAINT "PK_notes" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_username" ON "public"."User"("username");
