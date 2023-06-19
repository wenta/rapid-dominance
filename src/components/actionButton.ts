import * as menuItemSettings from "../settings/textureSettings";
import { Actions } from "../actions";
export class ActionButton extends Phaser.GameObjects.Container {
    private image: Phaser.GameObjects.Image
    private text: Phaser.GameObjects.Text
    private buttonBeginPosition: Phaser.Math.Vector2
    private buttonEndPosition: Phaser.Math.Vector2
    private actionName: Actions
    private action: (x: Actions) => void

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, buttonScale: number, actionName: Actions, action: (x: Actions) => void) {
        super(scene, x, y)

        this.image = scene.add.image(x + (menuItemSettings.buttonWidth / 2), y, texture)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonSelected())
            .setScale(buttonScale, buttonScale);


        this.text = scene.add.text(this.image.x, this.image.y, text)
            .setOrigin(0.5)
            .setFontSize(this.image.height + "px")
            .setColor('#000000')

        this.buttonBeginPosition = new Phaser.Math.Vector2(x, y)
        this.buttonEndPosition = new Phaser.Math.Vector2(x + menuItemSettings.buttonWidth, y + menuItemSettings.buttonHeight)
        this.actionName = actionName
        this.add(this.image)
        this.add(this.text)
        this.action = action
    }
    buttonSelected() {
        this.action(this.actionName)
    }
    getBeginPosition(): Phaser.Math.Vector2 { return this.buttonBeginPosition }
    getEndPosition(): Phaser.Math.Vector2 { return this.buttonEndPosition }

}