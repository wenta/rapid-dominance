import * as filemapSettings from "./settings/filemapSettings";
import { blankFieldResistance, townhallResistance } from './settings/gameSettings';

export default class Field {
    player: number | null
    occupied: boolean
    blocked: boolean
    x: number
    y: number
    typeField: number
    resistance: number
    isGoldDeposit: boolean
    initialFogOfWar: boolean
    temporaryFogOfWar: boolean

    constructor(x: number, y: number, occupied: boolean, blocked: boolean
        , player: number | null = null, typeField: number = filemapSettings.blank, isGoldDeposit: boolean, resistance: number = blankFieldResistance) {
        this.x = x
        this.y = y
        this.occupied = occupied
        this.blocked = blocked
        this.player = player
        this.typeField = typeField
        this.isGoldDeposit = isGoldDeposit
        this.initialFogOfWar = true
        this.temporaryFogOfWar = true
        this.resistance = resistance
    }
}