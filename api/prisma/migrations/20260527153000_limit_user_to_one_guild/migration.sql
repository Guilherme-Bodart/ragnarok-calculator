DROP INDEX IF EXISTS "GuildMember_userId_idx";

CREATE UNIQUE INDEX "GuildMember_userId_key" ON "GuildMember"("userId");
