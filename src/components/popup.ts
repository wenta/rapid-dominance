export class Popup extends Phaser.GameObjects.Container {
    private text: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string) {
        super(scene, x, y);

        const textStyle = {
            fontSize: '42px',
            color: '#000000',
            wordWrap: { useAdvancedWrap: true, width: 500 },
            padding: {
                left: 50,
                right: 50,
                top: 50,
                bottom: 50,
            },
        };

        this.text = scene.add.text(x, y, text, textStyle);
        this.text.setOrigin(0.5);

        const textWidth = this.text.width + 100;
        const textHeight = this.text.height + 100;

        this.background = scene.add.image(x, y, texture);
        this.background.setOrigin(0);
        this.background.setScale(textWidth / this.background.width, textHeight / this.background.height);
        this.background.setPosition(this.text.x - 250, this.text.y - 100);

        this.add(this.background);
        this.add(this.text);

        scene.add.existing(this);
    }
}
