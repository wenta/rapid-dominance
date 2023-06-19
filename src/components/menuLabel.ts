import * as menuItemSettings from '../settings/textureSettings';
export class MenuLabel extends Phaser.GameObjects.Container {
    private image: Phaser.GameObjects.Image
    private text: Phaser.GameObjects.Text
    private labelBeginPosition: Phaser.Math.Vector2
    private labelEndPosition: Phaser.Math.Vector2

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, buttonScale: number) {
        super(scene, x, y);

        this.image = scene.add.image(x + (menuItemSettings.buttonWidth / 2) , y, texture).setScale(buttonScale, buttonScale);

        this.text = scene.add.text(this.image.x, this.image.y, text)
            .setOrigin(0.5)
            .setFontSize(this.image.height + "px")
            .setColor('#000000');

        this.add(this.image);
        this.add(this.text);
    }

    updateText(text: string){
        this.text.text = text;
    }

    getBeginPosition(): Phaser.Math.Vector2 { return this.labelBeginPosition }
    getEndPosition(): Phaser.Math.Vector2 { return this.labelEndPosition }

}