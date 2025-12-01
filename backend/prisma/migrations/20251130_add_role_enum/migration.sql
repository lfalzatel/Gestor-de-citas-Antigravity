-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- This migration preserves existing data while enforcing the role enum

PRAGMA foreign_keys=OFF;

-- Create new User table with role as TEXT (enum constraint via app)
CREATE TABLE "User_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "telefono" TEXT,
    "fechaNacimiento" DATETIME,
    "direccion" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy existing data
INSERT INTO "User_new" 
SELECT 
    "id",
    "email",
    "password",
    "name",
    "telefono",
    "fechaNacimiento",
    "direccion",
    "avatarUrl",
    "role",
    "createdAt",
    "updatedAt"
FROM "User";

-- Drop old table
DROP TABLE "User";

-- Rename new table
ALTER TABLE "User_new" RENAME TO "User";

-- Recreate indexes if needed
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_keys=ON;
