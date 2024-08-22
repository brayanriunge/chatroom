/*
  Warnings:

  - You are about to drop the column `adminId` on the `Reply` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Reply` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_adminId_fkey";

-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "adminId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
