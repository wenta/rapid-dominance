import Field from "./field";
import * as filemapSettings from "./settings/filemapSettings";

const BUILDING_VALUE: Record<number, number> = {
  [filemapSettings.townhall]: 1000,
  [filemapSettings.barrack]: 520,
  [filemapSettings.mine]: 460,
  [filemapSettings.observationTower]: 340,
  [filemapSettings.stoneWall]: 230,
  [filemapSettings.woodenWall]: 180,
  [filemapSettings.goldDeposit]: 110,
  [filemapSettings.blank]: 60
};

/** Scores a reachable sector from the point of view of an attacking bot. */
export function scoreAttackTarget(field: Field, alliedPlayerIds: number[]): number {
  if (field.player !== null && alliedPlayerIds.includes(field.player)) return Number.NEGATIVE_INFINITY;

  const baseValue = BUILDING_VALUE[field.typeField] ?? 40;
  const enemyTerritoryBonus = field.player === null ? 0 : 150;
  const damagedTargetBonus = Math.max(0, 8 - field.resistance) * 12;
  const resistancePenalty = Math.max(0, field.resistance - 1) * 28;
  const stableTieBreaker = (field.y * 0.001) + (field.x * 0.00001);
  return baseValue + enemyTerritoryBonus + damagedTargetBonus - resistancePenalty - stableTieBreaker;
}

export function rankAttackTargets(fields: Field[], alliedPlayerIds: number[]): Field[] {
  return fields
    .filter(field => !field.blocked && scoreAttackTarget(field, alliedPlayerIds) > Number.NEGATIVE_INFINITY)
    .sort((a, b) => scoreAttackTarget(b, alliedPlayerIds) - scoreAttackTarget(a, alliedPlayerIds));
}

export function isBuildableField(field: Field): boolean {
  return field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit;
}

export function chooseSafestBuildField(fields: Field[], hostileNeighborCount: (field: Field) => number): Field | undefined {
  return fields
    .filter(isBuildableField)
    .sort((a, b) => {
      const dangerDifference = hostileNeighborCount(a) - hostileNeighborCount(b);
      if (dangerDifference !== 0) return dangerDifference;
      return (a.y - b.y) || (a.x - b.x);
    })[0];
}

export function chooseFrontierBuildField(fields: Field[], hostileNeighborCount: (field: Field) => number): Field | undefined {
  return fields
    .filter(isBuildableField)
    .sort((a, b) => {
      const dangerDifference = hostileNeighborCount(b) - hostileNeighborCount(a);
      if (dangerDifference !== 0) return dangerDifference;
      return (a.y - b.y) || (a.x - b.x);
    })[0];
}
