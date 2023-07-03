import Player from '../player';
import * as menuItemSettings from '../settings/textureSettings';

export class PlayerLabel extends Phaser.GameObjects.Container {
    private image: Phaser.GameObjects.Image
    private text: Phaser.GameObjects.Text
    private labelBeginPosition: Phaser.Math.Vector2
    private labelEndPosition: Phaser.Math.Vector2
    private playerId: number

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, playerId: number, buttonScale: number) {
        super(scene, x, y);

        this.image = scene.add.image(x + (menuItemSettings.buttonWidth / 2), y, texture).setScale(buttonScale, buttonScale);
        this.playerId = playerId;
        this.text = scene.add.text(this.image.x, this.image.y, text)
            .setOrigin(0.5)
            .setFontSize(this.image.height + "px")
            .setColor('#000000');

        this.add(this.image);
        this.add(this.text);
    }

    update(player: Player, currentPlayer: number) {
        this.text.text = player.name;
        if (!player.isActive) {
            this.text.setColor("#808080")
        }
        else {
            if (player.playerId !== currentPlayer) {
                this.text.setFontSize(this.image.height + "px")
                    .setColor('#000000');
            }
            else {
                this.text.setFontSize(this.image.height + "px")
                    .setColor('#F00000');
            }
        }
    }

    getBeginPosition(): Phaser.Math.Vector2 { return this.labelBeginPosition }
    getEndPosition(): Phaser.Math.Vector2 { return this.labelEndPosition }

    getPlayerId() {
        return this.playerId;
    }

}