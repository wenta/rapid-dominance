import Field from "./field"

export default class SelectedField {
    field: Field
    graphics: Phaser.GameObjects.Graphics | undefined
    constructor(field: Field, graphics: Phaser.GameObjects.Graphics | undefined) {
        this.field = field
        this.graphics = graphics
    }

    clearGraphics() {
        if (this.clearGraphics !== undefined) {
            this.graphics?.destroy();
            this.graphics = undefined;
        }
    }
}