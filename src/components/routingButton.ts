import * as menuItemSettings from '../settings/textureSettings';

export class RoutingButton extends Phaser.GameObjects.Container {
    private image: Phaser.GameObjects.Image
    private text: Phaser.GameObjects.Text
    private buttonBeginPosition: Phaser.Math.Vector2
    private buttonEndPosition: Phaser.Math.Vector2
    private route: () => void

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, buttonScale: number, route: () => void) {
        super(scene, x, y)

        this.image = scene.add.image(x + (menuItemSettings.buttonWidth / 2), y, texture)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonSelected())
        


        this.text = scene.add.text(this.image.x, this.image.y, text)
            .setOrigin(0.5, 0.5)
            .setColor('#ffffff')

        this.buttonBeginPosition = new Phaser.Math.Vector2(x, y)
        this.buttonEndPosition = new Phaser.Math.Vector2(x + menuItemSettings.buttonWidth, y + menuItemSettings.buttonHeight)

        this.add(this.image)
        this.add(this.text)
        this.route = route.bind(this)
       
    }
    buttonSelected() {
        this.route();
    }
    getBeginPosition(): Phaser.Math.Vector2 { return this.buttonBeginPosition }
    getEndPosition(): Phaser.Math.Vector2 { return this.buttonEndPosition }

}