import { getColor } from './colorPallete';
import * as gameSettings from './settings/gameSettings';

export default class Player {
    playerId: number
    color: number
    gold: number
    troops: number
    actionPointsLimit: number
    actionPoints: number
    isHuman: boolean
    isActive: boolean
    experience: number
    team: number


    constructor(id: number, human: boolean = false, color: number | null = null, initialGold: number = gameSettings.initalGold,
        initialTroops: number = gameSettings.initalTroops, isActive: boolean = true, team: number | null = null)  {

        this.playerId = id
        this.gold = initialGold
        this.troops = initialTroops
        this.actionPointsLimit = gameSettings.initialActionPointsLimit
        this.actionPoints = gameSettings.initialActionPoints
        this.isHuman = human
        this.experience = 0
        this.isActive = isActive
        this.team = team ? team : this.playerId
        if (color) {
            this.color = color
        }
        else {
            this.color = getColor(id)
        }
    }

    descreaseGold(amount: number) {
        this.gold -= amount;
    }

    increaseGold(amount: number) {
        if (this.gold + amount < gameSettings.goldLimit) {
            this.gold += amount;
        }
        else {
            this.gold = gameSettings.goldLimit;
        }
    }

    descreaseTroops(amount: number) {
        this.troops -= amount;
    }

    increaseTroops(amount: number) {
        if (this.troops + amount < gameSettings.armyLimit) {
            this.troops += amount;
        }
        else {
            this.troops = gameSettings.armyLimit;
        }
    }

    descreaseActionPoints(amount: number) {
        this.actionPoints -= amount;
    }

    /**
     * Increases the action points of the player based on various factors such as inner fields, outer fields, and additional townhalls.
     * @param innerFieldsByPlayer The number of inner fields controlled by the player.
     * @param outerFieldsByPlayer The number of outer fields controlled by the player.
     * @param additionalTownhall The number of additional townhalls owned by the player.
     */
    increaseActionPoints(innerFieldsByPlayer: number, outerFieldsByPlayer: number, additionalTownhall: number) {
        let ap = Math.floor(gameSettings.actionPointGainPerRound +
            (innerFieldsByPlayer * gameSettings.actionPointGainPerRoundFromInnerFields) +
            (outerFieldsByPlayer * gameSettings.actionPointGainPerRoundFromOuterFields) +
            (additionalTownhall * gameSettings.actionPointGainPerRoundForAdditionalTownhall));

        if (this.actionPoints + ap < this.actionPointsLimit) {
            this.actionPoints += ap;
        }
        else {
            this.actionPoints = this.actionPointsLimit;
        }
    }

    /**
     * Increases the player's experience value by the specified amount.
     * If the experience value reaches a multiple of 50,
     * it increases the maximum action points limit.
     * @param amount The amount of experience to add.
     */
    increaseExperience(amount: number) {
        this.experience += amount;

        if (this.experience % 50 === 0) {
            this.actionPointsLimit += 1;
        }
    }


}