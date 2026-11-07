import { RoutingButton } from "./components/routingButton";
import { uiTheme } from "./uiTheme";

export class InstructionScene extends Phaser.Scene {
    sceneWidth: number = 0
    sceneHeight: number = 0

    constructor() {
        super('InstructionScene');
    }

    preload() {
        this.load.text('instructionText', 'assets/data/en/instruction.txt');
        this.load.image("background", "assets/menu-background-v3.webp");
    }

    create() {
        this.sceneWidth = this.cameras.main.width;
        this.sceneHeight = this.cameras.main.height;

        const background = this.add.image(this.sceneWidth / 2, this.sceneHeight / 2, 'background');
        background.setScale(Math.max(this.sceneWidth / background.width, this.sceneHeight / background.height));
        this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, 0x5c492e, 0.16);

        const contentWidth = Math.min(900, this.sceneWidth - 64);
        const scrollArea = new Phaser.Geom.Rectangle((this.sceneWidth - contentWidth) / 2, 24, contentWidth, this.sceneHeight - 48);
        this.add.rectangle(this.sceneWidth / 2 + 5, this.sceneHeight / 2 + 6, contentWidth + 24, this.sceneHeight - 28, 0x2e2419, 0.3);
        this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, contentWidth + 24, this.sceneHeight - 28, uiTheme.stoneLight, 0.97)
            .setStrokeStyle(3, uiTheme.border, 0.98);

        const textStyle = {
            fontFamily: uiTheme.serif,
            fontSize: '18px',
            color: uiTheme.ink,
            lineSpacing: 7,
            wordWrap: { width: scrollArea.width - 32 },

        };

        const textData = this.cache.text.get('instructionText');

        const mask = this.make.graphics();
        mask.fillRectShape(scrollArea);

        const container = this.add.container(scrollArea.x, scrollArea.y);
        let goBackButton = new RoutingButton(this, 110, 28, "menu_item", "← Back", 0.85,
            () => this.scene.start("WelcomeScene", {}));

        const instructionText = this.add.text(16, 72, '', textStyle);
        instructionText.setText(textData);
        container.add([goBackButton, instructionText]);

        const textHeight = instructionText.height;
        const scrollableHeight = scrollArea.height;

        if (textHeight > scrollableHeight) {
            const maskGraphics = this.make.graphics();
            maskGraphics.fillRect(scrollArea.x, scrollArea.y, scrollArea.width, scrollArea.height);
            container.mask = new Phaser.Display.Masks.GeometryMask(this, maskGraphics);

            let isDragging = false;
            let startY = 0;
            let scrollY = 0;
            let minY = scrollArea.y - textHeight + scrollArea.height;
            let maxY = scrollArea.y;

            this.input.on('pointerdown', (pointer) => {
                isDragging = true;
                startY = pointer.y;
                scrollY = container.y;
            });

            this.input.on('pointerup', () => {
                isDragging = false;
            });

            this.input.on('pointermove', (pointer) => {
                if (isDragging) {
                    const deltaY = pointer.y - startY;
                    const newScrollY = scrollY + deltaY;

                    if (newScrollY > maxY) {
                        container.y = maxY;
                    } else if (newScrollY < minY) {
                        container.y = minY;
                    } else {
                        container.y = newScrollY;
                    }
                }
            });

            this.input.on('wheel', (pointer, over, deltaX, deltaY, deltaZ) => {
                const newScrollY = container.y + deltaY * 10;

                if (newScrollY > maxY) {
                    container.y = maxY;
                } else if (newScrollY < minY) {
                    container.y = minY;
                } else {
                    container.y = newScrollY;
                }
            });
        }
    }




}
