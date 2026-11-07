import Field from "./field";
import Player from "./player";

export const GAME_SAVE_KEY = "rapid-dominance.save.v1";
export const GAME_SAVE_VERSION = 1;

export interface SavedGameMode {
  numberOfTeams: number;
  playersPerTeams: number;
  name: string;
}

export type SavedPlayer = Pick<Player,
  "playerId" | "color" | "gold" | "troops" | "actionPointsLimit" |
  "actionPoints" | "isHuman" | "isActive" | "experience" | "team" |
  "name" | "failedAttacksReceived">;

export type SavedField = Pick<Field,
  "player" | "occupied" | "blocked" | "x" | "y" | "typeField" |
  "resistance" | "isGoldDeposit" | "initialFogOfWar" | "temporaryFogOfWar">;

export interface GameSnapshot {
  version: number;
  savedAt: string;
  selectedMap: string;
  numberOfPlayers: number;
  selectedGameMode: SavedGameMode;
  roundNumber: number;
  currentPlayerId: number;
  selectedField: { x: number; y: number };
  players: SavedPlayer[];
  fields: SavedField[];
}

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function isGameSnapshot(value: unknown): value is GameSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<GameSnapshot>;
  return snapshot.version === GAME_SAVE_VERSION &&
    typeof snapshot.savedAt === "string" &&
    typeof snapshot.selectedMap === "string" && snapshot.selectedMap.length > 0 &&
    Number.isInteger(snapshot.numberOfPlayers) && (snapshot.numberOfPlayers ?? 0) >= 2 &&
    Number.isInteger(snapshot.roundNumber) && (snapshot.roundNumber ?? 0) >= 1 &&
    Number.isInteger(snapshot.currentPlayerId) &&
    !!snapshot.selectedGameMode && typeof snapshot.selectedGameMode.name === "string" &&
    Number.isInteger(snapshot.selectedGameMode.numberOfTeams) &&
    Number.isInteger(snapshot.selectedGameMode.playersPerTeams) &&
    !!snapshot.selectedField && Number.isInteger(snapshot.selectedField.x) && Number.isInteger(snapshot.selectedField.y) &&
    Array.isArray(snapshot.players) && snapshot.players.length === snapshot.numberOfPlayers &&
    snapshot.players.every(player => player && Number.isInteger(player.playerId) && typeof player.name === "string") &&
    Array.isArray(snapshot.fields) && snapshot.fields.length > 0 &&
    snapshot.fields.every(field => field && Number.isInteger(field.x) && Number.isInteger(field.y) && Number.isInteger(field.typeField));
}

export function readGameSnapshot(): GameSnapshot | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(GAME_SAVE_KEY);
    if (!raw) return undefined;
    const snapshot: unknown = JSON.parse(raw);
    if (isGameSnapshot(snapshot)) return snapshot;
    storage.removeItem(GAME_SAVE_KEY);
  } catch {
    // A corrupt or inaccessible save should never prevent the game from opening.
  }
  return undefined;
}

export function writeGameSnapshot(snapshot: GameSnapshot): boolean {
  const storage = getStorage();
  if (!storage || !isGameSnapshot(snapshot)) return false;
  try {
    storage.setItem(GAME_SAVE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function clearGameSnapshot(): void {
  try {
    getStorage()?.removeItem(GAME_SAVE_KEY);
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
}
