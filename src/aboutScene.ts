import { RoutingButton } from "./components/routingButton";
import { backgroundWidth, buttonHeight, buttonWidth } from "./settings/textureSettings";

export class AboutScene extends Phaser.Scene {
  sceneWidth: number = 0
  sceneHeight: number = 0

  constructor() {
    super('AboutScene');
  }

  preload() {
    this.load.text('aboutText', 'assets/data/en/about.txt');
    this.load.image("background", "assets/backgroundColorDesert.png");
  }

  create() {
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;

    this.add.sprite(0, 0, 'background').setOrigin(0).setScale(this.sceneWidth / backgroundWidth);

    const scrollArea = new Phaser.Geom.Rectangle(this.sceneWidth / 4, 50, this.sceneWidth / 2, this.sceneHeight - 100);

    const textStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000',
      align: 'justify',
      wordWrap: { width: scrollArea.width },

    };

    const textData = this.cache.text.get('aboutText');

    const mask = this.make.graphics();
    mask.fillRectShape(scrollArea);

    const container = this.add.container(scrollArea.x, scrollArea.y);
    let goBackButton = new RoutingButton(this, buttonWidth, buttonHeight / 2, "menu_item", "Go back", 1,
      () => this.scene.start("WelcomeScene", {}));
    const aboutText = this.add.text(0, buttonHeight * 2, '', textStyle);
    aboutText.setText(textData);
    container.add([goBackButton, aboutText]);

    const textHeight = aboutText.height;
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
