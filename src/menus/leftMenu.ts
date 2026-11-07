import { PlayerLabel } from "../components/playerLabel";
import Player from "../player";

export default class LeftMenu extends Phaser.GameObjects.Container {
    private playerLabels: PlayerLabel[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, players: Player[]) {
        super(scene, x, y);
        scene.add.existing(this);

        const background = scene.add.rectangle(width / 2, height / 2, width, height, 0x102728, 0.94)
            .setStrokeStyle(1, 0x42605e, 0.95);
        const title = scene.add.text(16, 14, "PLAYERS", {
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            color: "#f2d6a2",
            fontStyle: "bold",
            letterSpacing: 2
        });
        const subtitle = scene.add.text(16, 39, "Teams and player status", {
            fontFamily: "Arial, sans-serif",
            fontSize: "11px",
            color: "#75928f"
        });
        this.add([background, title, subtitle]);

        const grouped = [...players].sort((a, b) => a.team - b.team || a.playerId - b.playerId);
        const gap = grouped.length > 10 ? 3 : 6;
        const rowHeight = Math.max(27, Math.min(48, (height - 76 - gap * Math.max(0, grouped.length - 1)) / grouped.length));
        grouped.forEach((player, index) => {
            const row = new PlayerLabel(scene, width / 2, 68 + rowHeight / 2 + index * (rowHeight + gap), width - 20, rowHeight, player);
            this.playerLabels.push(row);
            this.add(row);
        });
    }

    updatePlayerList(players: Player[], currentPlayer: number) {
        players.forEach(player => this.playerLabels.find(label => label.getPlayerId() === player.playerId)?.update(player, currentPlayer));
    }
}
