-- AlterEnum: rename SportType enum value FOOTBALL_PADEL to FOOTBALL (preserves existing data)
ALTER TYPE "SportType" RENAME VALUE 'FOOTBALL_PADEL' TO 'FOOTBALL';
