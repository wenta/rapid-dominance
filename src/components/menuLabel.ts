import { uiTheme } from "../uiTheme";

export class MenuLabel extends Phaser.GameObjects.Container {
    private valueText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, label: string, value: string) {
        super(scene, x, y);
        scene.add.existing(this);

        const background = scene.add.rectangle(0, 0, width, height, uiTheme.parchment, 0.98)
            .setStrokeStyle(1, uiTheme.borderSoft, 0.95);
        const labelText = scene.add.text(-(width / 2) + 10, -(height / 2) + 7, label.toUpperCase(), {
            fontFamily: uiTheme.sans,
            fontSize: "10px",
            color: uiTheme.inkMuted,
            fontStyle: "bold"
        });
        this.valueText = scene.add.text(-(width / 2) + 10, (height / 2) - 7, value, {
            fontFamily: uiTheme.serif,
            fontSize: "16px",
            color: uiTheme.ink,
            fontStyle: "bold"
        }).setOrigin(0, 1);

        this.add([background, labelText, this.valueText]);
    }

    updateText(text: string) {
        this.valueText.setText(text);
        this.valueText.setFontSize(text.length > 34 ? 11 : text.length > 22 ? 13 : 16);
    }
}
