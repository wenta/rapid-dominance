import { Actions } from "../actions";
import { ActionButton } from "../components/actionButton";
import { MenuLabel } from "../components/menuLabel";
import * as gameSettings from "../settings/gameSettings";
import { uiTheme } from "../uiTheme";

export default class RightMenu extends Phaser.GameObjects.Container {
    private actionPointsLabel: MenuLabel;
    private goldAmountLabel: MenuLabel;
    private troopsAmountLabel: MenuLabel;
    private experiencePointsLabel: MenuLabel;
    private landControlledLabel: MenuLabel;
    private tileInfoLabel: MenuLabel;
    private turnText: Phaser.GameObjects.Text;

    private attackButton: ActionButton;
    private leaveButton: ActionButton;
    private finishButton: ActionButton;
    private buildTownhallButton: ActionButton;
    private buildMineButton: ActionButton;
    private buildBarracksButton: ActionButton;
    private buildObservationTowerButton: ActionButton;
    private buildWoodenWallButton: ActionButton;
    private buildStoneWallButton: ActionButton;
    private repairButton: ActionButton;
    private demolishButton: ActionButton;
    private transferGoldButton: ActionButton;
    private actionButtons: ActionButton[];
    private currentGold = 0;
    private currentAp = 0;
    private currentTroops = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, action: (x: Actions) => void, onMenu: () => void) {
        super(scene, x, y);
        scene.add.existing(this);

        const padding = 14;
        const gap = 8;
        const innerWidth = width - padding * 2;
        const shadow = scene.add.rectangle(width / 2 + 4, height / 2 + 5, width, height, 0x2e2419, 0.28);
        const background = scene.add.rectangle(width / 2, height / 2, width, height, uiTheme.stone, 0.99)
            .setStrokeStyle(3, uiTheme.border, 1);
        const innerFrame = scene.add.rectangle(width / 2, height / 2, width - 10, height - 10, 0xffffff, 0)
            .setStrokeStyle(1, uiTheme.stoneLight, 0.95);
        const headerRule = scene.add.rectangle(width / 2, 62, width - 28, 1, uiTheme.borderSoft, 0.8);
        const title = scene.add.text(padding, 13, "COMMAND", {
            fontFamily: uiTheme.serif,
            fontSize: "18px",
            color: uiTheme.ink,
            fontStyle: "bold",
            letterSpacing: 1
        });
        this.turnText = scene.add.text(padding, 38, "Preparing turn…", {
            fontFamily: uiTheme.sans,
            fontSize: "11px",
            color: uiTheme.inkMuted
        });
        const menuButton = scene.add.text(width - padding, 20, "MENU  ·  ESC", {
            fontFamily: uiTheme.sans,
            fontSize: "10px",
            color: "#774814",
            fontStyle: "bold",
            backgroundColor: "#ead9b4",
            padding: { x: 7, y: 5 }
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        menuButton.on("pointerover", () => menuButton.setColor("#aa641b"));
        menuButton.on("pointerout", () => menuButton.setColor("#774814"));
        menuButton.on("pointerdown", onMenu);
        this.add([shadow, background, innerFrame, headerRule, title, this.turnText, menuButton]);

        const threeColumnWidth = (innerWidth - gap * 2) / 3;
        this.actionPointsLabel = new MenuLabel(scene, padding + threeColumnWidth / 2, 82, threeColumnWidth, 48, "Action points", "8 / 12");
        this.goldAmountLabel = new MenuLabel(scene, padding + threeColumnWidth * 1.5 + gap, 82, threeColumnWidth, 48, "Gold", "300");
        this.troopsAmountLabel = new MenuLabel(scene, padding + threeColumnWidth * 2.5 + gap * 2, 82, threeColumnWidth, 48, "Troops", "10");

        const twoColumnWidth = (innerWidth - gap) / 2;
        this.experiencePointsLabel = new MenuLabel(scene, padding + twoColumnWidth / 2, 138, twoColumnWidth, 48, "Experience", "0 XP");
        this.landControlledLabel = new MenuLabel(scene, padding + twoColumnWidth * 1.5 + gap, 138, twoColumnWidth, 48, "Territory", "1 sector");
        this.tileInfoLabel = new MenuLabel(scene, padding + innerWidth / 2, 194, innerWidth, 48, "Selected sector", "Choose a tile on the map");
        this.add([
            this.actionPointsLabel,
            this.goldAmountLabel,
            this.troopsAmountLabel,
            this.experiencePointsLabel,
            this.landControlledLabel,
            this.tileInfoLabel
        ]);

        const sectionStyle = {
            fontFamily: uiTheme.sans,
            fontSize: "10px",
            color: uiTheme.inkMuted,
            fontStyle: "bold"
        };
        const buttonHeight = Math.max(26, Math.min(40, (height - 373) / 7));
        const actionTitleY = 225;
        this.add(scene.add.text(padding, actionTitleY, "TURN ACTIONS", sectionStyle));

        const actionY = actionTitleY + 28 + buttonHeight / 2;
        const attackWidth = innerWidth * 0.62;
        const leaveWidth = innerWidth - attackWidth - gap;
        this.attackButton = new ActionButton(scene, padding + attackWidth / 2, actionY, attackWidth, buttonHeight, "Attack  [A]  ·  2 AP / 1 troop", Actions.Attack, action, "primary");
        this.leaveButton = new ActionButton(scene, padding + attackWidth + gap + leaveWidth / 2, actionY, leaveWidth, buttonHeight, "Leave  [L]", Actions.Leave, action, "danger");
        const endTurnY = actionY + buttonHeight + gap;
        this.finishButton = new ActionButton(scene, padding + innerWidth / 2, endTurnY, innerWidth, buttonHeight, "END TURN  ·  SPACE / F", Actions.Finish, action, "success");

        const buildingTitleY = endTurnY + buttonHeight / 2 + 17;
        this.add(scene.add.text(padding, buildingTitleY, "CONSTRUCTION", sectionStyle));
        const gridWidth = (innerWidth - gap) / 2;
        const firstGridY = buildingTitleY + 27 + buttonHeight / 2;
        const leftX = padding + gridWidth / 2;
        const rightX = padding + gridWidth * 1.5 + gap;
        const gridStep = buttonHeight + gap;
        this.buildTownhallButton = new ActionButton(scene, leftX, firstGridY, gridWidth, buttonHeight, "Townhall [T]  ·  500G / 8AP", Actions.Townhall, action);
        this.buildMineButton = new ActionButton(scene, rightX, firstGridY, gridWidth, buttonHeight, "Mine [M]  ·  150G / 4AP", Actions.Mine, action);
        this.buildBarracksButton = new ActionButton(scene, leftX, firstGridY + gridStep, gridWidth, buttonHeight, "Barrack [B]  ·  100G / 4AP", Actions.Barrack, action);
        this.buildObservationTowerButton = new ActionButton(scene, rightX, firstGridY + gridStep, gridWidth, buttonHeight, "Tower [O]  ·  100G / 4AP", Actions.ObservationTower, action);
        this.buildWoodenWallButton = new ActionButton(scene, leftX, firstGridY + gridStep * 2, gridWidth, buttonHeight, "Wood wall [W]  ·  100G / 4AP", Actions.WoodenWall, action);
        this.buildStoneWallButton = new ActionButton(scene, rightX, firstGridY + gridStep * 2, gridWidth, buttonHeight, "Stone wall [S]  ·  200G / 6AP", Actions.StoneWall, action);

        const managementTitleY = firstGridY + gridStep * 2 + buttonHeight / 2 + 17;
        this.add(scene.add.text(padding, managementTitleY, "MANAGEMENT", sectionStyle));
        const manageY = managementTitleY + 27 + buttonHeight / 2;
        this.repairButton = new ActionButton(scene, leftX, manageY, gridWidth, buttonHeight, "Repair [R]  ·  25G+ / 2AP", Actions.Repair, action);
        this.demolishButton = new ActionButton(scene, rightX, manageY, gridWidth, buttonHeight, "Demolish [D]  ·  1AP", Actions.Demolish, action, "danger");
        this.transferGoldButton = new ActionButton(scene, padding + innerWidth / 2, manageY + gridStep, innerWidth, buttonHeight, "Send ally 50 gold  [G]", Actions.TransferGold, action);

        this.actionButtons = [
            this.attackButton, this.leaveButton, this.finishButton,
            this.buildTownhallButton, this.buildMineButton, this.buildBarracksButton,
            this.buildObservationTowerButton, this.buildWoodenWallButton, this.buildStoneWallButton,
            this.repairButton, this.demolishButton, this.transferGoldButton
        ];
        this.add(this.actionButtons);
    }

    updateCurrentPlayer(name: string, team: number, isHuman: boolean, round: number) {
        this.turnText.setText(`ROUND ${round}  •  ${isHuman ? "YOUR TURN" : "AI TURN"}  •  ${name}  •  TEAM ${team}`);
        this.turnText.setColor(isHuman ? "#995f1e" : uiTheme.inkMuted);
    }

    updateTroopsAmount(amount: number) { this.troopsAmountLabel.updateText(String(amount)); }
    updateGoldAmount(amount: number) { this.goldAmountLabel.updateText(String(amount)); }
    updateActionPoints(amount: number, limit: number) { this.actionPointsLabel.updateText(`${amount} / ${Math.trunc(limit)}`); }
    updateExperience(amount: number) { this.experiencePointsLabel.updateText(`${Math.trunc(amount)} XP`); }
    updateControlledLand(amount: number) { this.landControlledLabel.updateText(`${amount} ${amount === 1 ? "sector" : "sectors"}`); }
    updateTileInfo(text: string) { this.tileInfoLabel.updateText(text); }

    updateAffordability(gold: number, ap: number, troops: number) {
        this.currentGold = gold;
        this.currentAp = ap;
        this.currentTroops = troops;
        this.attackButton.setEnabled(ap >= gameSettings.fieldAttackAPCost && troops > 0);
        this.leaveButton.setEnabled(ap >= gameSettings.fieldLeaveAPCost);
        this.finishButton.setEnabled(true);
        this.buildTownhallButton.setEnabled(gold >= gameSettings.townhallGoldCost && ap >= gameSettings.townhallActionPointCost);
        this.buildMineButton.setEnabled(gold >= gameSettings.mineGoldCost && ap >= gameSettings.mineActionPointCost);
        this.buildBarracksButton.setEnabled(gold >= gameSettings.barrackGoldCost && ap >= gameSettings.barrackActionPointCost);
        this.buildObservationTowerButton.setEnabled(gold >= gameSettings.observationTowerGoldCost && ap >= gameSettings.observationTowerActionPointCost);
        this.buildStoneWallButton.setEnabled(gold >= gameSettings.stoneWallGoldCost && ap >= gameSettings.stoneWallActionPointCost);
        this.buildWoodenWallButton.setEnabled(gold >= gameSettings.woodenWallGoldCost && ap >= gameSettings.woodenWallActionPointCost);
        this.repairButton.setEnabled(gold >= gameSettings.repairGoldCostPerPoint && ap >= gameSettings.repairActionPointCost);
        this.demolishButton.setEnabled(ap >= gameSettings.demolishActionPointCost);
        this.transferGoldButton.setEnabled(gold >= 50);
    }

    updateContextAvailability(context: {
        attack: boolean;
        leave: boolean;
        build: boolean;
        repair: boolean;
        demolish: boolean;
        transfer: boolean;
        humanTurn: boolean;
    }) {
        const active = context.humanTurn;
        this.attackButton.setEnabled(active && context.attack && this.currentAp >= gameSettings.fieldAttackAPCost && this.currentTroops > 0);
        this.leaveButton.setEnabled(active && context.leave && this.currentAp >= gameSettings.fieldLeaveAPCost);
        this.finishButton.setEnabled(active);
        this.buildTownhallButton.setEnabled(active && context.build && this.currentGold >= gameSettings.townhallGoldCost && this.currentAp >= gameSettings.townhallActionPointCost);
        this.buildMineButton.setEnabled(active && context.build && this.currentGold >= gameSettings.mineGoldCost && this.currentAp >= gameSettings.mineActionPointCost);
        this.buildBarracksButton.setEnabled(active && context.build && this.currentGold >= gameSettings.barrackGoldCost && this.currentAp >= gameSettings.barrackActionPointCost);
        this.buildObservationTowerButton.setEnabled(active && context.build && this.currentGold >= gameSettings.observationTowerGoldCost && this.currentAp >= gameSettings.observationTowerActionPointCost);
        this.buildStoneWallButton.setEnabled(active && context.build && this.currentGold >= gameSettings.stoneWallGoldCost && this.currentAp >= gameSettings.stoneWallActionPointCost);
        this.buildWoodenWallButton.setEnabled(active && context.build && this.currentGold >= gameSettings.woodenWallGoldCost && this.currentAp >= gameSettings.woodenWallActionPointCost);
        this.repairButton.setEnabled(active && context.repair && this.currentGold >= gameSettings.repairGoldCostPerPoint && this.currentAp >= gameSettings.repairActionPointCost);
        this.demolishButton.setEnabled(active && context.demolish && this.currentAp >= gameSettings.demolishActionPointCost);
        this.transferGoldButton.setEnabled(active && context.transfer && this.currentGold >= 50);
    }

    showPlayerActionsAndBuilding(show: Boolean) {
        this.actionButtons.forEach(button => button.setAlpha(show ? 1 : 0.38));
    }
}
