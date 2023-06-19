import { Actions } from '../actions';
import { ActionButton } from '../components/actionButton';
import { MenuLabel } from '../components/menuLabel';
import * as menuItemSettings from '../settings/textureSettings';
import * as gameSettings from '../settings/gameSettings';

export default class RightMenu extends Phaser.GameObjects.Container {
    private actionPointsLabel: MenuLabel
    private goldAmountLabel: MenuLabel
    private troopsAmountLabel: MenuLabel
    private experiencePointsLabel: MenuLabel
    private landControlledLabel: MenuLabel

    private attackButton: ActionButton
    private leaveButton: ActionButton
    private finishButton: ActionButton

    private buildTownhallButton: ActionButton
    private buildMineButton: ActionButton
    private buildBarracksButton: ActionButton
    private buildObserwationTowerButton: ActionButton
    private buildWoddenWallButton: ActionButton
    private buildStoneWallButton: ActionButton

    private worldX: number

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, worldX: number, worldY: number, texture: string, tint: number = 0xffffff,
        verticalMargin: number = 40, buttonScale: number = 3, action: (x: Actions) => void) {

        super(scene, x, y)
        const xPosition = x + width * 0.75

        this.worldX = worldX

        this.actionPointsLabel = new MenuLabel(scene, xPosition, y, texture, gameSettings.initialActionPointsLimit + "/" + gameSettings.initialActionPointsLimit + " ap", buttonScale)
        this.goldAmountLabel = new MenuLabel(scene, xPosition, y + (verticalMargin * buttonScale), texture, gameSettings.initalGold + " gold ", buttonScale)
        this.troopsAmountLabel = new MenuLabel(scene, xPosition, y + (2 * verticalMargin * buttonScale), texture, gameSettings.initalTroops + " troops", buttonScale)
        this.experiencePointsLabel = new MenuLabel(scene, xPosition, y + (3 * verticalMargin * buttonScale), texture, "0 exp", buttonScale)
        this.landControlledLabel = new MenuLabel(scene, xPosition, y + (4 * verticalMargin * buttonScale), texture, "0 land", buttonScale)

        this.attackButton = new ActionButton(scene, xPosition, y + (6 * verticalMargin * buttonScale), texture, "Attack", buttonScale, Actions.Attack, action)
        this.leaveButton = new ActionButton(scene, xPosition, y + 7 * verticalMargin * buttonScale, texture, "Leave", buttonScale, Actions.Leave, action)
        this.finishButton = new ActionButton(scene, xPosition, y + 8 * verticalMargin * buttonScale, texture, "Finish", buttonScale, Actions.Finish, action)

        this.buildTownhallButton = new ActionButton(scene, xPosition, y + 10 * verticalMargin * buttonScale, texture, "Townhall", buttonScale, Actions.Townhall, action)
        this.buildMineButton = new ActionButton(scene, xPosition, y + 11 * verticalMargin * buttonScale, texture, "Mine", buttonScale, Actions.Mine, action)
        this.buildBarracksButton = new ActionButton(scene, xPosition, y + 12 * verticalMargin * buttonScale, texture, "Barrack", buttonScale, Actions.Barrack, action)
        this.buildObserwationTowerButton = new ActionButton(scene, xPosition, y + 15 * verticalMargin * buttonScale, texture, "Obserwation Tower", buttonScale, Actions.ObserwationTower, action)
        this.buildWoddenWallButton = new ActionButton(scene, xPosition, y + 14 * verticalMargin * buttonScale, texture, "Wooden wall", buttonScale, Actions.WoodenWall, action)
        this.buildStoneWallButton = new ActionButton(scene, xPosition, y + 13 * verticalMargin * buttonScale, texture, "Stone wall", buttonScale, Actions.StoneWall, action)

        this.add(this.actionPointsLabel)
        this.add(this.goldAmountLabel)
        this.add(this.troopsAmountLabel)
        this.add(this.experiencePointsLabel)
        this.add(this.landControlledLabel)

        this.add(this.attackButton)
        this.add(this.leaveButton)
        this.add(this.finishButton)

        this.add(this.buildTownhallButton)
        this.add(this.buildMineButton)
        this.add(this.buildBarracksButton)
//        this.add(this.buildObserwationTowerButton)
        this.add(this.buildWoddenWallButton)
        this.add(this.buildStoneWallButton)

    }

    updateTroopsAmount(amount: number) {
        this.troopsAmountLabel.updateText(amount + " troops");
    }

    updateGoldAmount(amount: number) {
        this.goldAmountLabel.updateText(amount + " gold");
    }

    updateActionPoints(amount: number, limit: number) {
        this.actionPointsLabel.updateText(amount + "/" + Math.trunc(limit) + " ap");
    }

    updateExperience(amount: number) {
        this.experiencePointsLabel.updateText(Math.trunc(amount) + " exp");
    }

    updateControlledLand(amount: number) {
        this.landControlledLabel.updateText(amount + " land");
    }
}
