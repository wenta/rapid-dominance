export class RoutingButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private route: () => void;
    private isEnabled = true;
    private baseColor = 0xc9823f;

    constructor(scene: Phaser.Scene, x: number, y: number, _texture: string, text: string, buttonScale: number, route: () => void) {
        super(scene, x, y);
        scene.add.existing(this);
        const width = 220 * buttonScale;
        const height = 48 * buttonScale;
        this.route = route;

        this.background = scene.add.rectangle(0, 0, width, height, this.baseColor, 0.98)
            .setStrokeStyle(2, 0xf0bb75, 0.9)
            .setInteractive({ useHandCursor: true });
        this.background.on("pointerdown", () => this.buttonSelected());
        this.background.on("pointerover", () => {
            if (this.isEnabled) this.background.setFillStyle(0xe39a51, 1);
        });
        this.background.on("pointerout", () => this.applyStyle());

        this.text = scene.add.text(0, 0, text, {
            fontFamily: "Arial, sans-serif",
            fontSize: `${18 * buttonScale}px`,
            color: "#fff4df",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.add([this.background, this.text]);
    }

    private applyStyle() {
        this.background.setFillStyle(this.isEnabled ? this.baseColor : 0x2c3d3e, this.isEnabled ? 0.98 : 0.75);
        this.background.setStrokeStyle(2, this.isEnabled ? 0xf0bb75 : 0x4e6262, 0.85);
        this.text.setColor(this.isEnabled ? "#fff4df" : "#819190");
    }

    buttonSelected() {
        if (this.isEnabled) this.route();
    }

    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        if (enabled) this.background.setInteractive({ useHandCursor: true });
        else this.background.disableInteractive();
        this.applyStyle();
    }

    setText(newText: string) {
        this.text.setText(newText);
    }

    setButtonColor(color: number) {
        this.baseColor = color;
        this.applyStyle();
    }
}
