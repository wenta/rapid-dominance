import Player from "../player";
import { uiTheme } from "../uiTheme";

export class PlayerLabel extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private accent: Phaser.GameObjects.Rectangle;
    private nameText: Phaser.GameObjects.Text;
    private teamText: Phaser.GameObjects.Text;
    private playerId: number;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, player: Player) {
        super(scene, x, y);
        scene.add.existing(this);
        this.playerId = player.playerId;

        this.background = scene.add.rectangle(0, 0, width, height, uiTheme.parchment, 0.98)
            .setStrokeStyle(1, uiTheme.borderSoft, 0.95);
        this.accent = scene.add.rectangle(-(width / 2) + 3, 0, 5, height - 6, player.color, 1);
        this.nameText = scene.add.text(-(width / 2) + 16, -7, player.name, {
            fontFamily: uiTheme.serif,
            fontSize: `${Math.max(11, Math.min(15, height * 0.36))}px`,
            color: uiTheme.ink,
            fontStyle: "bold"
        }).setOrigin(0, 0.5);
        this.teamText = scene.add.text(-(width / 2) + 16, 9, `TEAM ${player.team}`, {
            fontFamily: uiTheme.sans,
            fontSize: `${Math.max(9, Math.min(11, height * 0.25))}px`,
            color: uiTheme.inkMuted
        }).setOrigin(0, 0.5);
        this.add([this.background, this.accent, this.nameText, this.teamText]);
    }

    update(player: Player, currentPlayer: number) {
        const active = player.isActive;
        const current = player.playerId === currentPlayer;
        this.nameText.setText(player.name);
        this.teamText.setText(`TEAM ${player.team}${player.isHuman ? "  •  YOU" : ""}`);
        this.background.setFillStyle(current ? uiTheme.parchmentHover : uiTheme.parchment, active ? 0.99 : 0.6);
        this.background.setStrokeStyle(current ? 2 : 1, current ? uiTheme.gold : uiTheme.borderSoft, 0.95);
        this.accent.setAlpha(active ? 1 : 0.25);
        this.nameText.setColor(active ? uiTheme.ink : "#8a8171");
        this.teamText.setColor(current ? "#995f1e" : uiTheme.inkMuted);
    }

    getPlayerId() {
        return this.playerId;
    }
}
