import { PlayerLabel } from "../components/playerLabel";
import Player from "../player";
import { uiTheme } from "../uiTheme";

export default class LeftMenu extends Phaser.GameObjects.Container {
    private playerLabels: PlayerLabel[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, players: Player[]) {
        super(scene, x, y);
        scene.add.existing(this);

        const shadow = scene.add.rectangle(width / 2 + 4, height / 2 + 5, width, height, 0x2e2419, 0.28);
        const background = scene.add.rectangle(width / 2, height / 2, width, height, uiTheme.stone, 0.99)
            .setStrokeStyle(3, uiTheme.border, 1);
        const innerFrame = scene.add.rectangle(width / 2, height / 2, width - 10, height - 10, 0xffffff, 0)
            .setStrokeStyle(1, uiTheme.stoneLight, 0.95);
        const headerRule = scene.add.rectangle(width / 2, 59, width - 28, 1, uiTheme.borderSoft, 0.8);
        const title = scene.add.text(16, 14, "PLAYERS", {
            fontFamily: uiTheme.serif,
            fontSize: "18px",
            color: uiTheme.ink,
            fontStyle: "bold",
            letterSpacing: 1
        });
        const subtitle = scene.add.text(16, 39, "Teams and player status", {
            fontFamily: uiTheme.sans,
            fontSize: "11px",
            color: uiTheme.inkMuted
        });
        this.add([shadow, background, innerFrame, headerRule, title, subtitle]);

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
