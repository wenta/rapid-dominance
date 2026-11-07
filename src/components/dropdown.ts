import { uiTheme } from "../uiTheme";

export interface DropdownOption {
    text: string;
    value: any;
    image: string;
}

export default class Dropdown extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private chevron: Phaser.GameObjects.Text;
    private optionsContainer: Phaser.GameObjects.Container;
    private isOpen = false;
    private controlWidth = 280;
    private readonly controlHeight = 48;
    private options: DropdownOption[] = [];
    private onSelect: (value: any) => void = () => {};
    private optionOffset = 0;
    private readonly maxVisibleOptions = 7;
    private wheelHandler: (_pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        _texture: string,
        labelText: string,
        options: DropdownOption[],
        onSelect: (text: string) => void
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this.controlWidth = Math.min(280, scene.cameras.main.width - 28);
        this.setDepth(50);

        this.background = scene.add.rectangle(0, 0, this.controlWidth, this.controlHeight, uiTheme.parchment, 0.99)
            .setStrokeStyle(2, uiTheme.border, 0.95)
            .setInteractive({ useHandCursor: true });
        this.background.on("pointerdown", () => this.toggleOptions());
        this.background.on("pointerover", () => this.background.setFillStyle(uiTheme.parchmentHover, 1));
        this.background.on("pointerout", () => this.background.setFillStyle(uiTheme.parchment, 0.99));

        this.label = scene.add.text(-(this.controlWidth / 2) + 16, 0, labelText, {
            color: uiTheme.ink,
            fontSize: "16px",
            fontFamily: uiTheme.serif,
            fontStyle: "bold"
        }).setOrigin(0, 0.5);
        this.chevron = scene.add.text((this.controlWidth / 2) - 18, 0, "▾", {
            color: "#8a541c",
            fontSize: "18px",
            fontFamily: uiTheme.serif
        }).setOrigin(0.5);
        this.add([this.background, this.label, this.chevron]);

        this.optionsContainer = scene.add.container(x, y + this.controlHeight + 4).setDepth(300).setVisible(false);
        this.renderOptions(scene, options, onSelect);
        this.wheelHandler = (_pointer, _over, _dx, dy) => {
            if (!this.isOpen || this.options.length <= this.maxVisibleOptions) return;
            const maxOffset = this.options.length - this.maxVisibleOptions;
            this.optionOffset = Phaser.Math.Clamp(this.optionOffset + (dy > 0 ? 1 : -1), 0, maxOffset);
            this.renderVisibleOptions(scene);
        };
        scene.input.on("wheel", this.wheelHandler);
        scene.events.on("dropdown-opened", (opened: Dropdown) => {
            if (opened !== this) this.close();
        });
    }

    private renderOptions(scene: Phaser.Scene, options: DropdownOption[], onSelect: (value: any) => void) {
        this.options = options;
        this.onSelect = onSelect;
        this.optionOffset = 0;
        this.renderVisibleOptions(scene);
    }

    private renderVisibleOptions(scene: Phaser.Scene) {
        this.optionsContainer.removeAll(true);
        const visibleOptions = this.options.slice(this.optionOffset, this.optionOffset + this.maxVisibleOptions);
        visibleOptions.forEach((option, index) => {
            const optionY = index * (this.controlHeight + 2);
            const optionBackground = scene.add.rectangle(0, optionY, this.controlWidth, this.controlHeight, uiTheme.stoneLight, 0.99)
                .setStrokeStyle(1, uiTheme.borderSoft, 0.95)
                .setInteractive({ useHandCursor: true });
            const optionText = scene.add.text(-(this.controlWidth / 2) + 16, optionY, option.text, {
                color: uiTheme.ink,
                fontSize: "15px",
                fontFamily: uiTheme.serif
            }).setOrigin(0, 0.5);
            optionBackground.on("pointerover", () => optionBackground.setFillStyle(uiTheme.parchmentHover, 1));
            optionBackground.on("pointerout", () => optionBackground.setFillStyle(uiTheme.stoneLight, 0.99));
            optionBackground.on("pointerdown", () => {
                this.setLabelText(option.text);
                this.onSelect(option.value);
                this.close();
            });
            this.optionsContainer.add([optionBackground, optionText]);
        });
        if (this.options.length > this.maxVisibleOptions) {
            const infoY = visibleOptions.length * (this.controlHeight + 2) - 13;
            const infoBackground = scene.add.rectangle(0, infoY, this.controlWidth, 22, uiTheme.stoneDark, 0.99)
                .setStrokeStyle(1, uiTheme.border, 0.9);
            const rangeEnd = Math.min(this.options.length, this.optionOffset + visibleOptions.length);
            const infoText = scene.add.text(0, infoY, `SCROLL  •  ${this.optionOffset + 1}–${rangeEnd} OF ${this.options.length}`, {
                color: uiTheme.ink, fontSize: "10px", fontFamily: uiTheme.sans, fontStyle: "bold"
            }).setOrigin(0.5);
            this.optionsContainer.add([infoBackground, infoText]);
        }
    }

    public setLabelText(text: string) { this.label.setText(text); }
    public close() { this.isOpen = false; this.optionsContainer.setVisible(false); this.chevron.setText("▾"); }
    public open() { this.isOpen = true; this.optionsContainer.setVisible(true); this.chevron.setText("▴"); this.scene.events.emit("dropdown-opened", this); }
    private toggleOptions() { this.isOpen ? this.close() : this.open(); }
    updateOptions(scene: Phaser.Scene, options: DropdownOption[], onSelect: (text: string) => void) { this.renderOptions(scene, options, onSelect); }

    destroy(fromScene?: boolean) {
        if (this.wheelHandler) this.scene?.input.off("wheel", this.wheelHandler);
        this.optionsContainer?.destroy(fromScene);
        super.destroy(fromScene);
    }
}
