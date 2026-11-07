import { uiTheme } from "../uiTheme";

export class Popup extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, _texture: string, text: string) {
        super(scene, x, y);
        scene.add.existing(this);

        const width = Math.min(520, scene.cameras.main.width - 40);
        const message = scene.add.text(0, 0, text, {
            fontFamily: uiTheme.serif,
            fontSize: "17px",
            color: uiTheme.ink,
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: width - 48, useAdvancedWrap: true }
        }).setOrigin(0.5);
        const height = Math.max(58, message.height + 28);
        const shadow = scene.add.rectangle(5, 6, width, height, 0x000000, 0.28);
        const background = scene.add.rectangle(0, 0, width, height, uiTheme.stoneLight, 0.99)
            .setStrokeStyle(3, uiTheme.border, 0.98);
        this.add([shadow, background, message]);
        this.setDepth(1000);
    }
}
