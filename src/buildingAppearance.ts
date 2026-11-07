import * as filemapSettings from "./settings/filemapSettings";
import * as gameSettings from "./settings/gameSettings";

const damageVariants: Record<number, { damaged: number; critical: number; maximum: number }> = {
  [filemapSettings.townhall]: {
    damaged: filemapSettings.damagedTownhall,
    critical: filemapSettings.criticalTownhall,
    maximum: gameSettings.townhallResistance
  },
  [filemapSettings.barrack]: {
    damaged: filemapSettings.damagedBarrack,
    critical: filemapSettings.criticalBarrack,
    maximum: gameSettings.barrackResistance
  },
  [filemapSettings.mine]: {
    damaged: filemapSettings.damagedMine,
    critical: filemapSettings.criticalMine,
    maximum: gameSettings.mineResistance
  },
  [filemapSettings.observationTower]: {
    damaged: filemapSettings.damagedObservationTower,
    critical: filemapSettings.criticalObservationTower,
    maximum: gameSettings.observationTowerResistance
  },
  [filemapSettings.woodenWall]: {
    damaged: filemapSettings.damagedWoodenWall,
    critical: filemapSettings.criticalWoodenWall,
    maximum: gameSettings.woodenWallResistance
  },
  [filemapSettings.stoneWall]: {
    damaged: filemapSettings.damagedStoneWall,
    critical: filemapSettings.criticalStoneWall,
    maximum: gameSettings.stoneWallResistance
  }
};

export function getBuildingTileIndex(type: number, resistance: number): number {
  const variants = damageVariants[type];
  if (!variants || resistance >= variants.maximum) return type;
  return resistance / variants.maximum <= 0.5 ? variants.critical : variants.damaged;
}
