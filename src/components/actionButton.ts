import { Actions } from "../actions";
import { uiTheme } from "../uiTheme";

export type ActionButtonVariant = "primary" | "secondary" | "success" | "danger";

const COLORS: Record<ActionButtonVariant, { normal: number; hover: number; border: number }> = {
    primary: { normal: 0xb8732c, hover: 0xd18c3b, border: 0xe3b36c },
    secondary: { normal: 0xc4ae82, hover: 0xd9c69e, border: 0x745a39 },
    success: { normal: uiTheme.green, hover: uiTheme.greenHover, border: 0xa8bd72 },
    danger: { normal: uiTheme.danger, hover: uiTheme.dangerHover, border: 0xd08b77 }
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
            fontFamily: uiTheme.serif,
            fontSize: `${Math.max(11, Math.min(14, height * 0.32))}px`,
            color: variant === "secondary" ? uiTheme.ink : "#fff8e8",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: width - 12, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.add([this.background, this.text]);
    }

    private applyStyle() {
        const colors = COLORS[this.variant];
        this.background.setFillStyle(this.isEnabled ? colors.normal : uiTheme.disabled, this.isEnabled ? 0.98 : 0.72);
        this.background.setStrokeStyle(2, this.isEnabled ? colors.border : uiTheme.borderSoft, 0.8);
        this.text.setColor(this.isEnabled ? (this.variant === "secondary" ? uiTheme.ink : "#fff8e8") : uiTheme.disabledText);
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
