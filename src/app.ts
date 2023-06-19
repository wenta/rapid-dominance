import "phaser";
import { WelcomeScene } from "./welcomeScene";
import { GameScene } from "./gameScene";
import { InstructionScene } from "./instructionScene";
import { AboutScene } from "./aboutScene";

const MAX_SIZE_WIDTH_SCREEN = 1920
const MAX_SIZE_HEIGHT_SCREEN = 1080
const MIN_SIZE_WIDTH_SCREEN = 270
const MIN_SIZE_HEIGHT_SCREEN = 480
const SIZE_WIDTH_SCREEN = window.innerWidth
const SIZE_HEIGHT_SCREEN = window.innerHeight

const config: Phaser.Types.Core.GameConfig = {
    title: "Rapid Dominance",
    type: Phaser.AUTO,

    //width: 800,
    //height: 600,
    parent: "game",
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        width: SIZE_WIDTH_SCREEN,
        height: SIZE_HEIGHT_SCREEN,
        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,
            height: MIN_SIZE_HEIGHT_SCREEN
        },
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,
            height: MAX_SIZE_HEIGHT_SCREEN
        }
    },
    mode: Phaser.Scale.RESIZE,
    scene: [WelcomeScene, GameScene, InstructionScene, AboutScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    backgroundColor: "#FFC75F"
};

export class RapidDominanceGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
};

window.onload = () => {
    var game = new RapidDominanceGame(config);
};
