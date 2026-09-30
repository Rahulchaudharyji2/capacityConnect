-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "courseId" TEXT,
    "lessonId" TEXT,
    "uploaderId" TEXT NOT NULL,
    "extractedText" TEXT,
    "indexingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resource_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Resource" ("courseId", "createdAt", "description", "displayName", "id", "isArchived", "lessonId", "mimeType", "originalName", "sizeBytes", "storageKey", "updatedAt", "uploaderId") SELECT "courseId", "createdAt", "description", "displayName", "id", "isArchived", "lessonId", "mimeType", "originalName", "sizeBytes", "storageKey", "updatedAt", "uploaderId" FROM "Resource";
DROP TABLE "Resource";
ALTER TABLE "new_Resource" RENAME TO "Resource";
CREATE UNIQUE INDEX "Resource_storageKey_key" ON "Resource"("storageKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
