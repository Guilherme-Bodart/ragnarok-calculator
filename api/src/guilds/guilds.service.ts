import { Injectable } from "@nestjs/common";
import type { CreateMvpKillRequest } from "./guilds.schemas";
import { MockGuildsStore } from "./mock-guilds.store";

@Injectable()
export class GuildsService {
  constructor(private readonly store: MockGuildsStore) {}

  getCurrentContext() {
    return this.store.getCurrentContext();
  }

  getDashboard(slug: string) {
    return this.store.getDashboard(slug);
  }

  getMvpEntries(slug: string) {
    return { entries: this.store.getMvpEntries(slug) };
  }

  createMvpKill(slug: string, payload: CreateMvpKillRequest) {
    return { entry: this.store.createMvpKill(slug, payload) };
  }
}
