export class MenuLabel extends Phaser.GameObjects.Container {
    private valueText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, label: string, value: string) {
        super(scene, x, y);
        scene.add.existing(this);

        const background = scene.add.rectangle(0, 0, width, height, 0x1c3233, 0.96)
            .setStrokeStyle(1, 0x42605e, 0.9);
        const labelText = scene.add.text(-(width / 2) + 10, -(height / 2) + 7, label.toUpperCase(), {
            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            color: "#89aaa5",
            fontStyle: "bold"
        });
        this.valueText = scene.add.text(-(width / 2) + 10, (height / 2) - 7, value, {
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            color: "#f5e9cf",
            fontStyle: "bold"
        }).setOrigin(0, 1);

        this.add([background, labelText, this.valueText]);
    }

    updateText(text: string) {
        this.valueText.setText(text);
        this.valueText.setFontSize(text.length > 34 ? 11 : text.length > 22 ? 13 : 16);
    }
}
