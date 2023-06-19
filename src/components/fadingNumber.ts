export class FadingNumber extends Phaser.GameObjects.Text {
  private fadeDuration: number;
  private fadeDelay: number;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string
    , style: Phaser.Types.GameObjects.Text.TextStyle = { fontSize: '32px', color: '#ffffff' }) {
    super(scene, x, y, text, style);

    this.fadeDuration = 2000;
    this.fadeDelay = 1000;

    this.setOrigin(0.5);
    this.setDepth(1);
    scene.add.existing(this);
  }

  public displayNumber(number: number) {
    this.setText(number.toString());

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: this.fadeDuration,
      delay: this.fadeDelay,
      onComplete: () => {
        this.setText('');
      }
    });
  }
}
