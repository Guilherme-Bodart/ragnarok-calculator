ALTER TABLE "Guild" ADD COLUMN "ownerUserId" TEXT;

CREATE TABLE "GuildRole" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7dd3fc',
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuildToolAccess" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "minimumRoleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildToolAccess_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuildRole_guildId_rank_key" ON "GuildRole"("guildId", "rank");
CREATE INDEX "GuildRole_guildId_idx" ON "GuildRole"("guildId");
CREATE UNIQUE INDEX "GuildToolAccess_guildId_toolId_key" ON "GuildToolAccess"("guildId", "toolId");
CREATE INDEX "GuildToolAccess_guildId_idx" ON "GuildToolAccess"("guildId");

INSERT INTO "GuildRole" ("id", "guildId", "name", "color", "rank", "createdAt", "updatedAt")
SELECT 'role_' || "id" || '_leader', "id", 'Lider', '#f4c95d', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Guild";

INSERT INTO "GuildRole" ("id", "guildId", "name", "color", "rank", "createdAt", "updatedAt")
SELECT 'role_' || "id" || '_officer', "id", 'Oficial', '#67e8f9', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Guild";

INSERT INTO "GuildRole" ("id", "guildId", "name", "color", "rank", "createdAt", "updatedAt")
SELECT 'role_' || "id" || '_member', "id", 'Membro', '#a7b0c0', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Guild";

UPDATE "Guild"
SET "ownerUserId" = owner."userId"
FROM (
  SELECT DISTINCT ON ("guildId") "guildId", "userId"
  FROM "GuildMember"
  ORDER BY "guildId",
    CASE "role"
      WHEN 'admin' THEN 1
      WHEN 'leader' THEN 2
      WHEN 'officer' THEN 3
      ELSE 4
    END,
    "createdAt" ASC
) owner
WHERE "Guild"."id" = owner."guildId";

ALTER TABLE "GuildMember" ADD COLUMN "roleId" TEXT;
ALTER TABLE "GuildInvite" ADD COLUMN "roleId" TEXT;
ALTER TABLE "GuildEvent" ADD COLUMN "requiredRoleId" TEXT;

UPDATE "GuildMember"
SET "roleId" =
  CASE
    WHEN "role" IN ('admin', 'leader') THEN 'role_' || "guildId" || '_leader'
    WHEN "role" = 'officer' THEN 'role_' || "guildId" || '_officer'
    ELSE 'role_' || "guildId" || '_member'
  END;

UPDATE "GuildInvite"
SET "roleId" =
  CASE
    WHEN "role" IN ('admin', 'leader') THEN 'role_' || "guildId" || '_leader'
    WHEN "role" = 'officer' THEN 'role_' || "guildId" || '_officer'
    ELSE 'role_' || "guildId" || '_member'
  END;

UPDATE "GuildEvent"
SET "requiredRoleId" =
  CASE
    WHEN "requiredRole" IN ('admin', 'leader') THEN 'role_' || "guildId" || '_leader'
    WHEN "requiredRole" = 'officer' THEN 'role_' || "guildId" || '_officer'
    ELSE 'role_' || "guildId" || '_member'
  END;

ALTER TABLE "Guild" ALTER COLUMN "ownerUserId" SET NOT NULL;
ALTER TABLE "GuildMember" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "GuildInvite" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "GuildEvent" ALTER COLUMN "requiredRoleId" SET NOT NULL;

ALTER TABLE "GuildMember" DROP COLUMN "role";
ALTER TABLE "GuildInvite" DROP COLUMN "role";
ALTER TABLE "GuildEvent" DROP COLUMN "requiredRole";

DROP TYPE "GuildMemberRole";

CREATE INDEX "Guild_ownerUserId_idx" ON "Guild"("ownerUserId");

ALTER TABLE "Guild" ADD CONSTRAINT "Guild_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuildRole" ADD CONSTRAINT "GuildRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "GuildRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuildInvite" ADD CONSTRAINT "GuildInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "GuildRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuildEvent" ADD CONSTRAINT "GuildEvent_requiredRoleId_fkey" FOREIGN KEY ("requiredRoleId") REFERENCES "GuildRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuildToolAccess" ADD CONSTRAINT "GuildToolAccess_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuildToolAccess" ADD CONSTRAINT "GuildToolAccess_minimumRoleId_fkey" FOREIGN KEY ("minimumRoleId") REFERENCES "GuildRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
