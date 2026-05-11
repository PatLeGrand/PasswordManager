/*
  Warnings:

  - You are about to drop the column `credifentialId` on the `Passkey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[credentialId]` on the table `Passkey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credentialId` to the `Passkey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Passkey_credifentialId_key` ON `Passkey`;

-- AlterTable
ALTER TABLE `Passkey` DROP COLUMN `credifentialId`,
    ADD COLUMN `credentialId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Passkey_credentialId_key` ON `Passkey`(`credentialId`);
