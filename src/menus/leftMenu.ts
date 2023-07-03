import { PlayerLabel } from '../components/playerLabel';
import Player from '../player';

export default class LeftMenu extends Phaser.GameObjects.Container {
    private playerLabels: Array<PlayerLabel> = []

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, buttonTexture: string, players: Player[], tint: number = 0xffffff,
        verticalMargin: number = 25, buttonScale: number = 3) {
        super(scene, x, y);
        const xPosition = x + width / 2

        for (let i = 0; i < players.length; i++) {
            let x = new PlayerLabel(scene, xPosition, y + (verticalMargin * (i + 1) * buttonScale), buttonTexture, players[i].name, i, buttonScale);
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
