import { uiTheme } from "../uiTheme";

export class RoutingButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private route: () => void;
    private isEnabled = true;
    private baseColor = 0xb8732c;
    private buttonWidth: number;
    private baseFontSize: number;

    constructor(scene: Phaser.Scene, x: number, y: number, _texture: string, text: string, buttonScale: number, route: () => void) {
        super(scene, x, y);
        scene.add.existing(this);
        const width = 220 * buttonScale;
        const height = 48 * buttonScale;
        this.buttonWidth = width;
        this.baseFontSize = 18 * buttonScale;
        this.route = route;

        this.background = scene.add.rectangle(0, 0, width, height, this.baseColor, 0.98)
            .setStrokeStyle(2, uiTheme.goldLight, 0.95)
            .setInteractive({ useHandCursor: true });
        this.background.on("pointerdown", () => this.buttonSelected());
        this.background.on("pointerover", () => {
            if (this.isEnabled) this.background.setFillStyle(0xd18c3b, 1);
        });
        this.background.on("pointerout", () => this.applyStyle());

        this.text = scene.add.text(0, 0, text, {
            fontFamily: uiTheme.serif,
            fontSize: `${this.baseFontSize}px`,
            color: "#fff4df",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.fitText();
        this.add([this.background, this.text]);
    }

    private fitText() {
        this.text.setFontSize(this.baseFontSize);
        const availableWidth = this.buttonWidth - 22;
        if (this.text.width > availableWidth) {
            const fittedSize = Math.max(10, Math.floor(this.baseFontSize * availableWidth / this.text.width));
            this.text.setFontSize(fittedSize);
        }
    }

    private applyStyle() {
        this.background.setFillStyle(this.isEnabled ? this.baseColor : uiTheme.disabled, this.isEnabled ? 0.98 : 0.75);
        this.background.setStrokeStyle(2, this.isEnabled ? uiTheme.goldLight : uiTheme.borderSoft, 0.85);
        this.text.setColor(this.isEnabled ? "#fff4df" : uiTheme.disabledText);
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
        this.fitText();
    }

    setButtonColor(color: number) {
        this.baseColor = color;
        this.applyStyle();
    }
}
