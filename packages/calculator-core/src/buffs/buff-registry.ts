import type { BuffEffect } from "../buff-effects";

export type BuffResolverContext = {
  level: number;
  baseLevel: number;
  jobLevel: number;
};

export type BuffResolver = (context: BuffResolverContext) => BuffEffect;

export class BuffRegistry {
  private resolvers = new Map<string, BuffResolver>();

  register(buffId: string, resolver: BuffResolver) {
    this.resolvers.set(buffId, resolver);
  }

  resolve(buffs: Record<string, number>, baseLevel: number, jobLevel: number): BuffEffect[] {
    const effects: BuffEffect[] = [];

    for (const [buffId, level] of Object.entries(buffs)) {
      if (level <= 0) continue;
      const resolver = this.resolvers.get(buffId);
      if (resolver) {
        effects.push(resolver({ level, baseLevel, jobLevel }));
      }
    }

    return effects;
  }
}

export const globalBuffRegistry = new BuffRegistry();
