/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `SharedPassword` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SharedPassword_tokenHash_key` ON `SharedPassword`(`tokenHash`);
