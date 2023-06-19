import { PlayerLabel } from '../components/playerLabel';
import Player from '../player';
import * as textureSettings from '../settings/textureSettings';

export default class LeftMenu extends Phaser.GameObjects.Container {
    private playerLabels: Array<PlayerLabel> = []
    private bg: Array<Array<Phaser.GameObjects.Image>> = []

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, buttonTexture: string, players: number, tint: number = 0xffffff,
        verticalMargin: number = 25, buttonScale: number = 3) {
        super(scene, x, y);
        const xPosition = x + width / 2
 
        for (let i = 0; i < players; i++) {
            let x = new PlayerLabel(scene, xPosition, y + (verticalMargin * (i + 1) * buttonScale), buttonTexture, "Player " + i, i, buttonScale);
            this.playerLabels.push(x);
            this.add(x);
        }

        this.w = width

    }


    updatePlayerList(players: Player[], currentPlayer: number) {

        for (let i = 0; i < players.length; i++) {
            let p = players[i];
            let label = this.playerLabels.find(x => x.getPlayerId() === p.playerId)
            if (label) {
                label.update(p, currentPlayer);
            }

        }
    }
}
