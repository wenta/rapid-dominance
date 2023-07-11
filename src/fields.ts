import Field from "./field";
import * as filemapSettings from './settings/filemapSettings';

export default class Fields {
    private fields: Field[][];

    constructor(fields: Field[][]) {
        this.fields = fields
    }

    get(y, x) {
        return this.fields[y][x];
    }

    set(y, x, field: Field) {
        this.fields[y][x] = field;
    }

    /**
    * Retrieves all fields owned by the specified player.
    * @param playerID The ID of the player.
    * @returns An array of fields owned by the player.
    */
    getPlayerFields(playerID: number) {
        return this.fields.map((array) => array.filter((obj) => obj.player == playerID))
            .reduce((accumulator, value) => accumulator.concat(value), []);
    }

    /**
     * Executes the specified function for each field in the collection.
     * @param fun The function to execute for each field.
     */
    forEach(fun: (field: Field) => void) {
        for (const row of this.fields) {
            for (const field of row) {
                fun(field);
            }
        }
    }

    /**
    * Checks if a field can be annexed by the specified player.
    * @param player The ID of the player.
    * @param field The field to check.
    * @returns A boolean value indicating if the field can be annexed.
    */
    checkIfFieldCanBeAnnexed(player: number, field: Field): boolean {
        const x = field.x
        const y = field.y
        const topField = this.fields[y - 1]?.[x];
        const bottomField = this.fields[y + 1]?.[x];
        const leftField = this.fields[y]?.[x - 1];
        const rightField = this.fields[y]?.[x + 1];
        return ((topField && topField.player === player) || topField === undefined) &&
            ((bottomField && bottomField.player === player) || bottomField === undefined) &&
            ((leftField && leftField.player === player) || leftField === undefined) &&
            ((rightField && rightField.player === player) || rightField === undefined) &&
            (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)
    }

    /**
     * Retrieves a list of neighboring fields that can be annexed by the specified player.
     * @param player The ID of the player.
     * @param field The field to check neighboring fields for.
     * @returns An array of neighboring fields that can be annexed.
     */
    listNeighboringFieldsThatCanBeAnnexed(player: number, field: Field): Field[] {
        const neighboringFields: Field[] = [];
        const x = field.x
        const y = field.y
        const topField = this.fields[y - 1]?.[x];
        const bottomField = this.fields[y + 1]?.[x];
        const leftField = this.fields[y]?.[x - 1];
        const rightField = this.fields[y]?.[x + 1];

        if (topField && this.checkIfFieldCanBeAnnexed(player, topField)) {
            neighboringFields.push(topField)
        }
        if (bottomField && this.checkIfFieldCanBeAnnexed(player, bottomField)) {
            neighboringFields.push(bottomField)
        }
        if (leftField && this.checkIfFieldCanBeAnnexed(player, leftField)) {
            neighboringFields.push(leftField)
        }
        if (rightField && this.checkIfFieldCanBeAnnexed(player, rightField)) {
            neighboringFields.push(rightField)
        }
        return neighboringFields
    }

    /**
     * Retrieves neighboring fields owned by the specified player.
     * @param player The ID of the player.
     * @returns An array of neighboring fields owned by the player.
     */
    getNeighboringFieldsByPlayer(player: number): Field[] {
        const neighboringFields: Field[] = [];

        const playerFields = this.fields.flatMap((array) => array.filter((obj) => obj.player === player));

        for (const field of playerFields) {
            const x = field.x
            const y = field.y

            const topField = this.fields[y - 1]?.[x];
            const bottomField = this.fields[y + 1]?.[x];
            const leftField = this.fields[y]?.[x - 1];
            const rightField = this.fields[y]?.[x + 1];

            if (topField && !neighboringFields.includes(topField) && topField.player != player) {
                neighboringFields.push(topField);
            }
            if (bottomField && !neighboringFields.includes(bottomField) && bottomField.player != player) {
                neighboringFields.push(bottomField);
            }
            if (leftField && !neighboringFields.includes(leftField) && leftField.player != player) {
                neighboringFields.push(leftField);
            }
            if (rightField && !neighboringFields.includes(rightField) && rightField.player != player) {
                neighboringFields.push(rightField);
            }
        }
        return neighboringFields;
    }

    /**
     * Retrieves the fields encircling the specified field.
     * @param field The field to retrieve encircling fields for.
     * @returns An array of encircling fields.
     */
    getEncirclingFieldsByField(field: Field): Field[] {
        const neighboringFields: Field[] = [];

        const x = field.x
        const y = field.y

        const topField = this.fields[y - 1]?.[x];
        const bottomField = this.fields[y + 1]?.[x];
        const leftField = this.fields[y]?.[x - 1];
        const rightField = this.fields[y]?.[x + 1];

        const topLeftField = this.fields[y - 1]?.[x - 1];
        const topRightField = this.fields[y - 1]?.[x + 1];
        const bottomLeftField = this.fields[y + 1]?.[x - 1];
        const bottomRightField = this.fields[y + 1]?.[x + 1];

        if (topField && !neighboringFields.includes(topField)) {
            neighboringFields.push(topField);
        }
        if (bottomField && !neighboringFields.includes(bottomField)) {
            neighboringFields.push(bottomField);
        }
        if (leftField && !neighboringFields.includes(leftField)) {
            neighboringFields.push(leftField);
        }
        if (rightField && !neighboringFields.includes(rightField)) {
            neighboringFields.push(rightField);
        }

        if (topLeftField && !neighboringFields.includes(topLeftField)) {
            neighboringFields.push(topLeftField);
        }
        if (topRightField && !neighboringFields.includes(topRightField)) {
            neighboringFields.push(topRightField);
        }
        if (bottomLeftField && !neighboringFields.includes(bottomLeftField)) {
            neighboringFields.push(bottomLeftField);
        }
        if (bottomRightField && !neighboringFields.includes(bottomRightField)) {
            neighboringFields.push(bottomRightField);
        }

        return neighboringFields;
    }

    /**
     * Retrieves inner fields owned by the specified player.
     * `Inner field` refers to fields that are surrounded by other fields belonging to the same player. 
     * In other words, they are spaces that are inside the area occupied by a given player and are surrounded 
     * by other spaces belonging to the same player.
     * 
     * @param player The ID of the player.
     * @returns An array of inner fields owned by the player.
     */
    getInnerFieldsByPlayer(player: number): Field[] {
        const innerFields: Field[] = [];

        const playerFields = this.getPlayerFields(player);

        for (const field of playerFields) {
            const x = field.x;
            const y = field.y;

            const topField = this.fields[y - 1]?.[x];
            const bottomField = this.fields[y + 1]?.[x];
            const leftField = this.fields[y]?.[x - 1];
            const rightField = this.fields[y]?.[x + 1];

            if (
                topField &&
                bottomField &&
                leftField &&
                rightField &&
                topField.player === player &&
                bottomField.player === player &&
                leftField.player === player &&
                rightField.player === player
            ) {
                innerFields.push(field);
            }
        }

        return innerFields;
    }


    /**
     * Retrieves outer fields owned by the specified player.
     * `Outer fields` refers to fields that are outside the area occupied by a given player. 
     * These are spaces that border at least one space that is not owned by the same player or the edge of the board.
     * 
     * @param player The ID of the player.
     * @returns An array of outer fields owned by the player.
     */
    getOuterFieldsByPlayer(player: number): Field[] {
        const outerFields: Field[] = [];

        const playerFields = this.getPlayerFields(player);

        for (const field of playerFields) {
            const x = field.x;
            const y = field.y;

            const topField = this.fields[y - 1]?.[x];
            const bottomField = this.fields[y + 1]?.[x];
            const leftField = this.fields[y]?.[x - 1];
            const rightField = this.fields[y]?.[x + 1];

            if (
                !topField ||
                !bottomField ||
                !leftField ||
                !rightField ||
                topField.player !== player ||
                bottomField.player !== player ||
                leftField.player !== player ||
                rightField.player !== player
            ) {
                outerFields.push(field);
            }
        }

        return outerFields;
    }

    /**
   * Retrieves a list of player fields and neighboring fields within the specified range.
   * @param playerID The ID of the player.
   * @param range The range within which to retrieve fields.
   * @returns An array of player fields and neighboring fields within the range.
   */
    listPlayerFieldsAndNeighboringFieldsInRange(playerID: number, range: number): Field[] {
        const playerFields: Field[] = this.getPlayerFields(playerID);
        const neighboringFieldsInRange: Field[] = [];

        for (const field of playerFields) {
            const neighboringFields = this.listNeighboringFieldsInRange(range, field);
            neighboringFieldsInRange.push(...neighboringFields);
        }

        return [...playerFields, ...neighboringFieldsInRange];
    }

    /**
     * Retrieves neighboring fields within the specified range around the given field.
     * @param range The range within which to retrieve neighboring fields.
     * @param field The field to check for neighboring fields.
     * @returns An array of neighboring fields within the range.
     */
    private listNeighboringFieldsInRange(range: number, field: Field): Field[] {
        const neighboringFields: Field[] = [];
        const x = field.x;
        const y = field.y;

        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                const neighborField = this.fields[y + i]?.[x + j];
                if (neighborField && neighborField !== field) {
                    neighboringFields.push(neighborField);
                }
            }
        }

        return neighboringFields;
    }

}