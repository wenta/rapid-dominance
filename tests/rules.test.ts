import Field from "../src/field";
import Fields from "../src/fields";
import Player from "../src/player";
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

testExperienceProgression();
testActionPointIncome();
testFailedAttackArmyGrowth();
testAnnexationRequiresFourSides();

console.log("Rule regression tests passed.");
