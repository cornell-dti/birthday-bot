/*
  Warnings:

  - Added the required column `updatedAt` to the `Birthday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Birthday" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Birthday" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
