export interface DropdownOption {
    text: string;
    value: any;
    image: string;
}

export default class Dropdown extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private label: Phaser.GameObjects.Text;
    private optionsContainer: Phaser.GameObjects.Container;
    private isOpen: boolean;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        labelText: string,
        options: DropdownOption[],
        onSelect: (text: string) => void
    ) {
        super(scene, x, y);
        scene.add.existing(this);

        this.isOpen = false;

        this.background = scene.add.image(0, 0, texture);
        this.label = scene.add.text(0, 0, labelText, { color: '#ffffff' });
        this.background.setInteractive();
        this.background.on('pointerdown', this.toggleOptions, this);
        this.label.setOrigin(0.5, 0.5);
        this.add([this.background, this.label]);

        this.optionsContainer = scene.add.container(x, y + this.background.displayHeight);
        options.forEach((option, index) => {
            const optionImage = scene.add.image(0, index * this.background.displayHeight, option.image);
            const optionText = scene.add.text(0, index * this.background.displayHeight, option.text, {
                color: '#ffffff',
                align: 'center',
                fixedWidth: this.background.displayWidth,
            });
            optionImage.setInteractive();
            optionImage.on('pointerdown', () => {
                onSelect(option.value);
                this.toggleOptions();
            }, this);
            optionText.setOrigin(0.5);
            this.optionsContainer.addAt([optionImage, optionText], 0);
        });

        this.optionsContainer.setVisible(false);
        scene.add.existing(this.optionsContainer);
        this.optionsContainer.setDepth(scene.children.length);

    }

    private toggleOptions() {
        this.isOpen = !this.isOpen;
        this.optionsContainer.setVisible(this.isOpen);
    }



    updateOptions(scene: Phaser.Scene, options: DropdownOption[], onSelect: (text: string) => void) {
        this.optionsContainer.removeAll(true);
        options.forEach((option, index) => {
            const optionImage = scene.add.image(0, index * this.background.displayHeight, option.image);
            const optionText = scene.add.text(0, index * this.background.displayHeight, option.text, {
                color: '#ffffff',
                align: 'center',
                fixedWidth: this.background.displayWidth,
            });
            optionImage.setInteractive();
            optionImage.on('pointerdown', () => {
                onSelect(option.value)
                this.optionsContainer.setVisible(false)
            }, this);
            optionText.setOrigin(0.5);
            this.optionsContainer.addAt([optionImage, optionText], 0);
        });
    }
}
