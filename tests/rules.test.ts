import Field from "../src/field";
import Fields from "../src/fields";
import Player from "../src/player";
import { GAME_SAVE_VERSION, isGameSnapshot } from "../src/gameSave";
import { chooseFrontierBuildField, chooseSafestBuildField, rankAttackTargets } from "../src/botStrategy";
import * as filemapSettings from "../src/settings/filemapSettings";

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
}

function makeField(x: number, y: number, player: number | null = null) {
    return new Field(x, y, false, false, player, filemapSettings.blank, false);
}

function testExperienceProgression() {
    const player = new Player(0, 1, "Human", true);
    const initialLimit = player.actionPointsLimit;
    player.increaseExperience(7.5);
    assert(player.actionPointsLimit === initialLimit, "AP limit must not grow before the next 8 XP threshold");
    player.increaseExperience(0.5);
    assert(player.actionPointsLimit === initialLimit + 1, "AP limit must grow by one at 8 XP");
    player.increaseExperience(16);
    assert(player.actionPointsLimit === initialLimit + 3, "crossing multiple XP thresholds must grant every AP level");
}

function testActionPointIncome() {
    const player = new Player(0, 1, "Human", true);
    player.actionPoints = 0;
    player.increaseActionPoints(25, 50, 0);
    assert(player.actionPoints === 8, "partial inner and outer field bonuses must not be combined");
    player.actionPoints = 0;
    player.actionPointsLimit = 30;
    player.increaseActionPoints(50, 100, 1);
    assert(player.actionPoints === 11, "AP income must include independent land and additional townhall bonuses");
}

function testFailedAttackArmyGrowth() {
    const player = new Player(0, 1, "Defender", false);
    const initialTroops = player.troops;
    player.registerFailedEnemyAttack();
    assert(player.troops === initialTroops, "one failed attack must not add a soldier");
    player.registerFailedEnemyAttack();
    assert(player.troops === initialTroops + 1, "two failed attacks must add one soldier");
}

function testAnnexationRequiresFourSides() {
    const grid: Field[][] = [];
    for (let y = 0; y < 3; y++) {
        const row: Field[] = [];
        for (let x = 0; x < 3; x++) row.push(makeField(x, y, 1));
        grid.push(row);
    }
    const fields = new Fields(grid);
    grid[1][1].player = null;
    assert(fields.checkIfFieldCanBeAnnexed(1, grid[1][1]), "a field surrounded on four sides must be annexable");
    grid[0][1].player = null;
    assert(!fields.checkIfFieldCanBeAnnexed(1, grid[0][1]), "the map edge must not count as a surrounding friendly field");
}

function testSaveValidation() {
    const player = new Player(0, 1, "Human", true);
    const field = makeField(0, 0, player.playerId);
    const snapshot = {
        version: GAME_SAVE_VERSION,
        savedAt: new Date().toISOString(),
        selectedMap: "one_vs_one",
        numberOfPlayers: 2,
        selectedGameMode: { numberOfTeams: 2, playersPerTeams: 1, name: "Deathmatch" },
        roundNumber: 3,
        currentPlayerId: player.playerId,
        selectedField: { x: 0, y: 0 },
        players: [
            { ...player },
            { ...new Player(1, 2, "Bot") }
        ],
        fields: [{ ...field }]
    };
    assert(isGameSnapshot(snapshot), "a complete versioned snapshot must be accepted");
    assert(!isGameSnapshot({ ...snapshot, version: 999 }), "an incompatible save version must be rejected");
    assert(!isGameSnapshot({ ...snapshot, players: [] }), "a save with missing players must be rejected");
}

function testBotTargetPriorities() {
    const neutral = makeField(2, 0, null);
    const alliedTownhall = new Field(1, 0, true, false, 1, filemapSettings.townhall, false, 1);
    const enemyMine = new Field(0, 0, true, false, 2, filemapSettings.mine, false, 1);
    const enemyTownhall = new Field(3, 0, true, false, 2, filemapSettings.townhall, false, 4);
    const ranked = rankAttackTargets([neutral, alliedTownhall, enemyMine, enemyTownhall], [0, 1]);
    assert(ranked[0] === enemyTownhall, "bots must prioritize an enemy townhall over less valuable targets");
    assert(!ranked.includes(alliedTownhall), "bots must never rank an allied field as an attack target");
}

function testBotBuildPlacement() {
    const safe = makeField(0, 0, 0);
    const exposed = makeField(1, 0, 0);
    const danger = (field: Field) => field === exposed ? 3 : 0;
    assert(chooseSafestBuildField([exposed, safe], danger) === safe, "economic buildings should prefer protected sectors");
    assert(chooseFrontierBuildField([safe, exposed], danger) === exposed, "defensive buildings should prefer exposed sectors");
}

testExperienceProgression();
testActionPointIncome();
testFailedAttackArmyGrowth();
testAnnexationRequiresFourSides();
testSaveValidation();
testBotTargetPriorities();
testBotBuildPlacement();

console.log("Rule regression tests passed.");
