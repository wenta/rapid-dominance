import { Actions } from "../actions";

export type ActionButtonVariant = "primary" | "secondary" | "success" | "danger";

const COLORS: Record<ActionButtonVariant, { normal: number; hover: number; border: number }> = {
    primary: { normal: 0xc9823f, hover: 0xe39a51, border: 0xf3bd77 },
    secondary: { normal: 0x304b4b, hover: 0x3d6160, border: 0x587b78 },
    success: { normal: 0x50733b, hover: 0x638c4a, border: 0x8faf70 },
    danger: { normal: 0x733f3a, hover: 0x925047, border: 0xb76a5e }
};

export class ActionButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private actionName: Actions;
    private action: (x: Actions) => void;
    private isEnabled = true;
    private variant: ActionButtonVariant;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        actionName: Actions,
        action: (x: Actions) => void,
        variant: ActionButtonVariant = "secondary"
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this.variant = variant;
        this.actionName = actionName;
        this.action = action;

        const colors = COLORS[variant];
        this.background = scene.add.rectangle(0, 0, width, height, colors.normal, 0.98)
            .setStrokeStyle(2, colors.border, 0.9)
            .setInteractive({ useHandCursor: true });
        this.background.on("pointerdown", () => this.buttonSelected());
        this.background.on("pointerover", () => {
            if (this.isEnabled) this.background.setFillStyle(COLORS[this.variant].hover, 1);
        });
        this.background.on("pointerout", () => this.applyStyle());

        this.text = scene.add.text(0, 0, text, {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(11, Math.min(14, height * 0.32))}px`,
            color: "#f7f0df",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: width - 12, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.add([this.background, this.text]);
    }

    private applyStyle() {
        const colors = COLORS[this.variant];
        this.background.setFillStyle(this.isEnabled ? colors.normal : 0x263536, this.isEnabled ? 0.98 : 0.72);
        this.background.setStrokeStyle(2, this.isEnabled ? colors.border : 0x425253, 0.8);
        this.text.setColor(this.isEnabled ? "#f7f0df" : "#7f9190");
    }

    buttonSelected() {
        if (this.isEnabled) this.action(this.actionName);
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

    setButtonColor(tint: number) {
        this.background.setFillStyle(tint, 1);
    }
}
