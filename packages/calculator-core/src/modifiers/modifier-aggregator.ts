import {
  modifierAggregationResultSchema,
  type AggregatedModifier,
  type ModifierAggregationResult,
  type ModifierTarget,
  type NormalizedModifier,
} from "./modifier.types";

export class ModifierAggregator {
  aggregate(modifiers: NormalizedModifier[]): ModifierAggregationResult {
    const bucketMap = new Map<string, AggregatedModifier>();

    for (const modifier of modifiers) {
      const key = this.createBucketKey(modifier);
      const bucket = bucketMap.get(key);

      if (!bucket) {
        bucketMap.set(key, {
          stat: modifier.stat,
          operator: modifier.operator,
          target: modifier.target,
          value: modifier.value,
          breakdown: [modifier],
        });
        continue;
      }

      bucket.value += modifier.value;
      bucket.breakdown.push(modifier);
    }

    return modifierAggregationResultSchema.parse({
      buckets: Array.from(bucketMap.values()),
    });
  }

  private createBucketKey(modifier: NormalizedModifier) {
    return [
      modifier.stat,
      modifier.operator,
      this.createTargetKey(modifier.target),
    ].join("|");
  }

  private createTargetKey(target: ModifierTarget) {
    if (target.type === "self") {
      return "self";
    }

    if (target.type === "race") {
      return `${target.type}:${target.raceId}`;
    }

    if (target.type === "element") {
      return `${target.type}:${target.elementId}`;
    }

    if (target.type === "size") {
      return `${target.type}:${target.sizeId}`;
    }

    return `${target.type}:${target.skillId}`;
  }
}
