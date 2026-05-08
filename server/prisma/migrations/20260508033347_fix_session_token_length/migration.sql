-- DropIndex
DROP INDEX `Session_token_key` ON `Session`;

-- AlterTable
ALTER TABLE `Session` MODIFY `token` TEXT NOT NULL;
