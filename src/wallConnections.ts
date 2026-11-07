import Field from "./field";
import * as filemapSettings from "./settings/filemapSettings";

export const WALL_TILESET_FIRST_GID = 24;
export const WALL_VARIANTS_PER_MATERIAL = 16;
export const WALL_VARIANTS_PER_DAMAGE_LEVEL = 32;

export const wallConnectionBits = {
  north: 1,
  east: 2,
  south: 4,
  west: 8
} as const;

export function isWallType(type: number): boolean {
  return type === filemapSettings.woodenWall || type === filemapSettings.stoneWall;
}

export function calculateWallConnectionMask(
  field: Pick<Field, "x" | "y">,
  getField: (x: number, y: number) => Field | undefined
): number {
  let mask = 0;
  if (isWallType(getField(field.x, field.y - 1)?.typeField ?? -1)) mask |= wallConnectionBits.north;
  if (isWallType(getField(field.x + 1, field.y)?.typeField ?? -1)) mask |= wallConnectionBits.east;
  if (isWallType(getField(field.x, field.y + 1)?.typeField ?? -1)) mask |= wallConnectionBits.south;
  if (isWallType(getField(field.x - 1, field.y)?.typeField ?? -1)) mask |= wallConnectionBits.west;
  return mask;
}

export function getConnectedWallTileIndex(type: number, connectionMask: number, damageLevel: 0 | 1 | 2 = 0): number {
  const materialOffset = type === filemapSettings.stoneWall ? WALL_VARIANTS_PER_MATERIAL : 0;
  return WALL_TILESET_FIRST_GID + (damageLevel * WALL_VARIANTS_PER_DAMAGE_LEVEL) + materialOffset + (connectionMask & 15);
}
