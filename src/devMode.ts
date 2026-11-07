import Player from "./player";

export const devInitialGold = 10_000;
export const devInitialActionPoints = 100;

export function applyDevStartingResources(player: Player): void {
  player.gold = devInitialGold;
  player.actionPoints = devInitialActionPoints;
  player.actionPointsLimit = Math.max(player.actionPointsLimit, devInitialActionPoints);
}
