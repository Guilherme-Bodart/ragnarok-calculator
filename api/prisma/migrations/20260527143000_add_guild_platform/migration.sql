CREATE TYPE "GuildMemberRole" AS ENUM ('member', 'officer', 'leader', 'admin');

CREATE TYPE "GuildPresence" AS ENUM ('online', 'offline');

CREATE TYPE "GuildInviteStatus" AS ENUM ('pending', 'accepted');

CREATE TYPE "GuildNotificationTone" AS ENUM ('info', 'warning', 'success');

CREATE TYPE "GuildFeedItemType" AS ENUM ('announcement', 'activity', 'system');

CREATE TYPE "GuildEventType" AS ENUM ('woe', 'farm', 'meeting');

CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emblemUrl" TEXT NOT NULL DEFAULT '/nightmare-reaper.png',
    "description" TEXT NOT NULL DEFAULT '',
    "server" TEXT NOT NULL DEFAULT 'Ragnarok Online',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "GuildMemberRole" NOT NULL DEFAULT 'member',
    "mainClass" TEXT NOT NULL DEFAULT '',
    "status" "GuildPresence" NOT NULL DEFAULT 'offline',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuildInvite" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "GuildMemberRole" NOT NULL DEFAULT 'member',
    "status" "GuildInviteStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildInvite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuildNotification" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tone" "GuildNotificationTone" NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuildFeedItem" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "GuildFeedItemType" NOT NULL DEFAULT 'activity',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildFeedItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuildEvent" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "type" "GuildEventType" NOT NULL DEFAULT 'farm',
    "requiredRole" "GuildMemberRole" NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MvpKill" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "mvpName" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "killedAt" TIMESTAMP(3) NOT NULL,
    "respawnMinutes" INTEGER NOT NULL,
    "respawnAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MvpKill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Guild_slug_key" ON "Guild"("slug");

CREATE UNIQUE INDEX "GuildMember_guildId_userId_key" ON "GuildMember"("guildId", "userId");

CREATE INDEX "GuildMember_userId_idx" ON "GuildMember"("userId");

CREATE INDEX "GuildInvite_guildId_idx" ON "GuildInvite"("guildId");

CREATE INDEX "GuildInvite_email_idx" ON "GuildInvite"("email");

CREATE INDEX "GuildNotification_guildId_createdAt_idx" ON "GuildNotification"("guildId", "createdAt");

CREATE INDEX "GuildFeedItem_guildId_createdAt_idx" ON "GuildFeedItem"("guildId", "createdAt");

CREATE INDEX "GuildEvent_guildId_startsAt_idx" ON "GuildEvent"("guildId", "startsAt");

CREATE INDEX "MvpKill_guildId_respawnAt_idx" ON "MvpKill"("guildId", "respawnAt");

CREATE INDEX "MvpKill_recordedById_idx" ON "MvpKill"("recordedById");

ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuildInvite" ADD CONSTRAINT "GuildInvite_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuildNotification" ADD CONSTRAINT "GuildNotification_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuildFeedItem" ADD CONSTRAINT "GuildFeedItem_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuildEvent" ADD CONSTRAINT "GuildEvent_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MvpKill" ADD CONSTRAINT "MvpKill_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MvpKill" ADD CONSTRAINT "MvpKill_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
