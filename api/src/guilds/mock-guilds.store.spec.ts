import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { MockGuildsStore } from "./mock-guilds.store";

describe("MockGuildsStore", () => {
  it("resolves the current user's active guild", () => {
    const store = new MockGuildsStore();
    const context = store.getCurrentContext();

    expect(context.activeGuild.slug).toBe("nightmare");
    expect(context.guilds).toHaveLength(1);
  });

  it("returns a dashboard when the current user belongs to the guild", () => {
    const store = new MockGuildsStore();
    const dashboard = store.getDashboard("nightmare");

    expect(dashboard.guild.userRole).toBe("owner");
    expect(dashboard.members.length).toBeGreaterThan(0);
  });

  it("rejects access to an existing guild when the current user is not a member", () => {
    const store = new MockGuildsStore();

    expect(() => store.getDashboard("valhalla")).toThrow(ForbiddenException);
  });

  it("returns not found for unknown guild slugs", () => {
    const store = new MockGuildsStore();

    expect(() => store.getDashboard("unknown")).toThrow(NotFoundException);
  });
});
