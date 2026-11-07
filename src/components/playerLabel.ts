import Player from "../player";

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

        this.background = scene.add.rectangle(0, 0, width, height, 0x1b3031, 0.94)
            .setStrokeStyle(1, 0x365253, 0.9);
        this.accent = scene.add.rectangle(-(width / 2) + 3, 0, 5, height - 6, player.color, 1);
        this.nameText = scene.add.text(-(width / 2) + 16, -7, player.name, {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(11, Math.min(15, height * 0.36))}px`,
            color: "#f2ead8",
            fontStyle: "bold"
        }).setOrigin(0, 0.5);
        this.teamText = scene.add.text(-(width / 2) + 16, 9, `TEAM ${player.team}`, {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.min(11, height * 0.25))}px`,
            color: "#88a29f"
        }).setOrigin(0, 0.5);
        this.add([this.background, this.accent, this.nameText, this.teamText]);
    }

    update(player: Player, currentPlayer: number) {
        const active = player.isActive;
        const current = player.playerId === currentPlayer;
        this.nameText.setText(player.name);
        this.teamText.setText(`TEAM ${player.team}${player.isHuman ? "  •  YOU" : ""}`);
        this.background.setFillStyle(current ? 0x31534d : 0x1b3031, active ? 0.97 : 0.55);
        this.background.setStrokeStyle(current ? 2 : 1, current ? 0xe6b76a : 0x365253, 0.95);
        this.accent.setAlpha(active ? 1 : 0.25);
        this.nameText.setColor(active ? "#f2ead8" : "#6f7d7c");
        this.teamText.setColor(current ? "#e6b76a" : "#88a29f");
    }

    getPlayerId() {
        return this.playerId;
    }
}
