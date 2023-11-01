import 'phaser';

import { Actions } from './actions';
import { FadingNumber } from './components/fadingNumber';
import { Popup } from './components/popup';
import Field from './field';
import Fields from './fields';
import GameMode, { deathmatch } from './gameMode';
import LeftMenu from './menus/leftMenu';
import RightMenu from './menus/rightMenu';
import Player from './player';
import SelectedField from './selectedField';
import * as filemapSettings from './settings/filemapSettings';
import * as gameSettings from './settings/gameSettings';
import { backgroundWidth, buttonSquareBrownPressedHeight, buttonSquareBrownPressedWidth } from './settings/textureSettings';



export class GameScene extends Phaser.Scene {
  timeDelta: number;
  info: Phaser.GameObjects.Text;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  leftPanel: LeftMenu;
  rightPanel: RightMenu;
  scaleFactor: number = 1
  rightPanelX: number = 0;
  centralPanelX: number = 0;
  mapLayerX: number = 0
  fields: Fields;
  selectedField: SelectedField
  numberOfPlayers: number = 4
  sceneWidth: number = 0
  sceneHeight: number = 0
  currentPlayer: Player
  players: Player[] = []
  borders: Phaser.GameObjects.Graphics | undefined
  timeSinceLastIncrement = 0;
  keys: Object
  fadingNumber: FadingNumber
  selectedMap: string = "grid"
  tilemapY = buttonSquareBrownPressedHeight * 0.75
  selectedGameMode: GameMode = deathmatch

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(data): void {
    this.timeDelta = 1000;
    this.selectedMap = data.selectedMap;
    this.numberOfPlayers = data.numberOfPlayers;
    this.selectedGameMode = data.selectedGameMode;
  }

  preload(): void {
    this.load.setBaseURL(".");
    this.load.image("eft_filemap", "assets/eft_filemap.png");
    this.load.image("menu_item", "assets/buttonLong_brown.png");
    this.load.image("background2", "assets/backgroundColorFall.png");
    this.load.image("tilemap_border", "assets/buttonSquare_brown_pressed.png");
    this.load.image("panel_beige", "assets/panel_beige.png");
    this.load.tilemapCSV('map', 'assets/' + this.selectedMap + '.csv')
  }



  createLeftPanel() {
    this.leftPanel = new LeftMenu(this, 0, 0, this.sceneWidth / 4, "menu_item", this.players);
    this.leftPanel.setScale(this.scaleFactor)
    this.add.container(0, 0, this.leftPanel)
  }

  performAction(name: Actions) {
    switch (name) {
      case Actions.Townhall: {
        break;
      }
      case Actions.Mine: {
        this.buildMine();
        break;
      }
      case Actions.Barrack: {
        this.buildBarrack();
        break;
      }
      case Actions.WoodenWall: {
        this.buildWoodenWall();
        break;
      }
      case Actions.StoneWall: {
        this.buildStoneWall();
        break;
      }
      case Actions.Attack: {
        this.humanAttack(this.selectedField.field);
        break;
      }
      case Actions.Leave: {
        this.leaveField(this.selectedField.field);
        break;
      }
      case Actions.Finish: {
        this.nextTurn();
        break;
      }
      default: {
        break;
      }
    }
  }


  initializeFields() {
    let playerNumber = 0
    let f = new Array<Array<Field>>();

    for (let y = 0; y < 20; y++) {
      let row: Field[] = new Array<Field>();
      for (let x = 0; x < 20; x++) {
        let tile = this.map.getTileAt(x, y)


        switch (tile?.index) {
          case filemapSettings.townhall: {
            row.push(new Field(x, y, false, false, playerNumber, filemapSettings.townhall, false, gameSettings.townhallResistance));
            playerNumber++;
            break;
          }
          case filemapSettings.goldDeposit: {
            row.push(new Field(x, y, false, false, null, filemapSettings.goldDeposit, true));
            break;
          }
          case filemapSettings.tree: {
            row.push(new Field(x, y, false, true, null, filemapSettings.tree, false));
            break;
          }
          case filemapSettings.stone: {
            row.push(new Field(x, y, false, true, null, filemapSettings.stone, false));
            break;
          }
          case filemapSettings.stoneWall: {
            row.push(new Field(x, y, false, false, null, filemapSettings.stoneWall, false, gameSettings.stoneWallResistance));
            break;
          }
          case filemapSettings.woodenWall: {
            row.push(new Field(x, y, false, false, null, filemapSettings.stoneWall, false, gameSettings.woodenWallResistance));
            break;
          }
          default: {
            row.push(new Field(x, y, false, false, null, filemapSettings.blank, false));
            break;
          }
        }


      }
      f.push(row);
    }
    this.fields = new Fields(f)

  }


  shuffleList<T>(list: T[]): T[] {
    const shuffledList = [...list]; // Create a copy of the list

    for (let i = shuffledList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Generate a random index

      // Swap elements at positions i and j
      [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
    }

    return shuffledList;
  }

  distinctList<T>(list: T[]): T[] {
    return Array.from(new Set(list))
  }



  /**
   * We set first player as a human player.
   */
  initializePlayers() {
    let names = ['Hammurabi', 'Cyrus', 'Saladin', 'Subutai', 'Joshua', 'Scipio', 'Clausewitz', 'Caesar', 'Sun Tzu',
      'Alexander', 'Napoleon', 'Hannibal', 'Ashoka', 'Charlemagne', 'Temujin', 'Attila', 'Shingen', 'Nobunaga',
      'Joan of Arc', 'Frederick']
    let playersInTeams: number[] = []
    for (let i = 1; i <= this.selectedGameMode.numberOfTeams; i++) {
      for (let j = 1; j <= this.selectedGameMode.playersPerTeams; j++) {
        playersInTeams.push(i);
      }
    }
    names = this.shuffleList(names)
    playersInTeams = this.shuffleList(playersInTeams)

    const humanPlayerIndex = Math.floor(Math.random() * this.numberOfPlayers);
    this.players = new Array<Player>();
    for (let i = 0; i < this.numberOfPlayers; i++) {
      const player = i === humanPlayerIndex ? new Player(i, playersInTeams.pop(), names[i], true) : new Player(i, playersInTeams.pop(), names[i])
      this.players.push(player)
    }
    this.currentPlayer = this.players[0]

    let p = this.players.find(x => x.isHuman)
    if (p) {
      let fields = this.fields.getPlayerFields(p.playerId);
      this.refreshFogOfWar();
      this.selectedField = new SelectedField(fields[0], undefined);
    }
  }

  createRigthPanel() {
    let y = 32
    let bindedAction = this.performAction.bind(this);
    this.rightPanel = new RightMenu(this, 0, 0, this.sceneWidth / 4, this.rightPanelX, y, "menu_item", 0xffffff, 25, 3, bindedAction);
    this.add.container(this.rightPanelX, y, this.rightPanel)
    this.rightPanel.setScale(this.scaleFactor)
  }

  create(): void {
    /**
     * Screen is here divided horizontally for 3 parts: 
     * - left menu (takes 1/4 of screen),
     * - tilemap (takes 1/2 of screen),
     * - right menu (takes 1/4 of screen),
     */
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;
    this.scaleFactor = (this.sceneWidth / 2) / (filemapSettings.tileWidth * 20)


    this.add.sprite(0, 0, 'background2').setOrigin(0).setScale(this.sceneWidth / backgroundWidth);



    this.map = this.make.tilemap({ key: 'map', tileWidth: filemapSettings.tileWidth, tileHeight: filemapSettings.tileHeight })
    let tileset = this.map.addTilesetImage('eft_filemap', undefined, filemapSettings.tileWidth, filemapSettings.tileHeight, -2, -2)

    if (tileset) {
      this.tileset = tileset
      let layer = this.map.createLayer(0, this.tileset, this.sceneWidth / 4, this.tilemapY)

      if (layer) {
        this.centralPanelX = layer.x
        layer.setScale(this.scaleFactor);
        this.mapLayerX = layer.x;
        this.rightPanelX = layer.getBounds().width + layer.x;
        layer.setAlpha(0.8)
        this.createRigthPanel()

        this.drawTilemapBorder(layer.getBounds().left, layer.getBounds().top, layer.getBounds().right, layer.getBounds().bottom)
      }
    }


    this.initializeFields()
    this.initializePlayers()
    this.createLeftPanel()

  }

  drawTilemapBorder(topLeftX: number, topLeftY: number, bottomRightX: number, bottomRightY: number) {

    let width = bottomRightX - topLeftX
    let scale = width / (20 * buttonSquareBrownPressedWidth)
    topLeftX = topLeftX - (0.5 * scale) * buttonSquareBrownPressedWidth
    topLeftY = topLeftY - (0.5 * scale) * buttonSquareBrownPressedHeight
    bottomRightX = bottomRightX + (0.5 * scale) * buttonSquareBrownPressedWidth
    bottomRightY = bottomRightY + (0.5 * scale) * buttonSquareBrownPressedHeight

    // draw top border:
    let i = topLeftX
    while (i <= bottomRightX) {
      this.add.image(0, 0, "tilemap_border").setScale(scale).setX(i).setY(topLeftY);
      i = i + buttonSquareBrownPressedWidth * scale
    }
    // draw left:
    i = topLeftY
    while (i < bottomRightY) {
      this.add.image(topLeftX, i, "tilemap_border").setScale(scale).setX(topLeftX).setY(i);
      i = i + buttonSquareBrownPressedHeight * scale
    }
    // draw right:
    i = topLeftY
    while (i < bottomRightY) {
      this.add.image(bottomRightX, i, "tilemap_border").setScale(scale).setX(bottomRightX).setY(i);
      i = i + buttonSquareBrownPressedHeight * scale
    }
    // draw bottom border:
    i = topLeftX
    while (i < bottomRightX + buttonSquareBrownPressedWidth * scale) {
      this.add.image(i, bottomRightY, "tilemap_border").setScale(scale).setX(i).setY(bottomRightY);
      i = i + buttonSquareBrownPressedWidth * scale
    }
  }


  createTileOutline(tileX: number, tileY: number, color: number = 0xff0000): Phaser.GameObjects.Graphics | undefined {
    const tile = this.map.getTileAt(tileX, tileY);

    if (tile) {
      const graphics = this.add.graphics();
      const thickness = 8;
      const alpha = 1;

      graphics.lineStyle(thickness, color, alpha);

      const tileSize = this.map.tileWidth;
      graphics.strokeRect(tile.pixelX, tile.pixelY, tileSize, tileSize);
      graphics.setScale(this.scaleFactor, this.scaleFactor)
      graphics.setX(this.centralPanelX)
      graphics.setY(this.tilemapY);
      return graphics
    }
  }

  drawBorders() {
    this.borders = this.add.graphics();
    const thickness = 8;
    const alpha = 1;
    const xShift = 0;
    const pulsateThickness = (this.cameras.main.width * 0.015, this.cameras.main.height * 0.02); // Thickness of the pulsating outline
    const pulsateSpeed = 0.005; // Speed of the pulsation

    for (let player of this.players) {
      this.borders.lineStyle(thickness, player.color, alpha);

      const fields: Field[] = this.fields.getPlayerFields(player.playerId);

      for (let field of fields) {
        const tile = this.map.getTileAt(field.x, field.y);
        if (tile && (player.isHuman || !field.temporaryFogOfWar)) {
          const tileSize = this.map.tileWidth;
          const isCurrentPlayerField = field.player === this.currentPlayer.playerId;

          if (isCurrentPlayerField) {
            // Calculate the pulsation thickness based on a sine wave
            const pulsate = Math.sin(this.time.now * pulsateSpeed) * 0.5 + 0.5;
            const pulsatingThickness = thickness + (pulsate * pulsateThickness);

            this.borders.lineStyle(pulsatingThickness, player.color, alpha);
          }

          if (fields.find(f => f.x === field.x && f.y === field.y - 1) === undefined) {
            this.borders.strokeLineShape(new Phaser.Geom.Line(
              tile.pixelX + xShift,
              tile.pixelY,
              tile.pixelX + tileSize + xShift,
              tile.pixelY
            ));
          }
          //if there is no user fields below draw a line
          if (fields.find(f => f.x === field.x && f.y === field.y + 1) === undefined) {
            this.borders.strokeLineShape(new Phaser.Geom.Line(
              tile.pixelX + xShift,
              tile.pixelY + tileSize,
              tile.pixelX + tileSize + xShift,
              tile.pixelY + tileSize
            ));
          }

          //if there is no user fields on left draw a line
          if (fields.find(f => f.x === field.x - 1 && f.y === field.y) === undefined) {
            this.borders.strokeLineShape(new Phaser.Geom.Line(
              tile.pixelX + xShift,
              tile.pixelY,
              tile.pixelX + xShift,
              tile.pixelY + tileSize
            ));
          }
          //if there is no user fields on right draw a line
          if (fields.find(f => f.x === field.x + 1 && f.y === field.y) === undefined) {
            this.borders.strokeLineShape(new Phaser.Geom.Line(
              tile.pixelX + tileSize + xShift,
              tile.pixelY,
              tile.pixelX + tileSize + xShift,
              tile.pixelY + tileSize
            ));
          }

          this.borders.setScale(this.scaleFactor, this.scaleFactor);
          this.borders.setX(this.centralPanelX);
          this.borders.setY(this.tilemapY);
        }
      }
    }
  }

  botAttack(ns: Field[]): boolean {
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }
    while (ns.length > 0) {
      let index = randomInt(0, ns.length - 1)
      let fieldToAttack = ns[index]
      let checkIfTownhalls = ns.find(x => x.typeField === filemapSettings.townhall)
      if (checkIfTownhalls) fieldToAttack = checkIfTownhalls
      let team: Number[] = this.players.filter(x => x.team === this.currentPlayer.team).map(x => x.playerId)
      let blockFriendlyField: boolean = fieldToAttack.player !== null ? team.includes(fieldToAttack.player) : false
      if (!blockFriendlyField) {
        const neighboringFieldsOfExaminatedField = this.fields.getEncirclingFieldsByField(fieldToAttack)
        const atLeastTwoCurrentPlayerFieldsInNeighborhood = neighboringFieldsOfExaminatedField.filter(x => x.player === this.currentPlayer.playerId).length >= 2
        const atLeastOneCurrentPlayerTownhallInNeighborhood = neighboringFieldsOfExaminatedField.filter(x => x.player === this.currentPlayer.playerId && x.typeField === filemapSettings.townhall).length >= 1

        if (atLeastOneCurrentPlayerTownhallInNeighborhood || atLeastTwoCurrentPlayerFieldsInNeighborhood) {
          this.attack(fieldToAttack);
          return true
        }
        else {
          ns.splice(index, 1);
        }
      } else {
        ns.splice(index, 1);
      }
    }

    return false
  }

  getPossibleFieldsToAttack() { // for bot
    let neighbours = this.fields.getNeighboringFieldsByPlayer(this.currentPlayer.playerId).filter(x => !x.blocked)
    let neighboursOccupied = neighbours.filter(x => x.occupied)
    let neighborFieldUnOccupied = neighbours.filter(x => !x.occupied)

    let res = this.botAttack(neighboursOccupied)
    if (!res) {
      this.botAttack(neighborFieldUnOccupied)
    }
  }

  humanAttack(field: Field) {
    if (this.currentPlayer.actionPoints >= gameSettings.fieldAttackAPCost) {
      let team: Number[] = this.players.filter(x => x.team === this.currentPlayer.team).map(x => x.playerId)
      let blockFriendlyField: boolean = field.player ? team.includes(field.player) : false
      if (!blockFriendlyField) {
        const fieldExistInNeighborhood = this.fields.getNeighboringFieldsByPlayer(this.currentPlayer.playerId)
          .find(f => f.x === field.x && f.y === field.y)
        const neighboringFieldsOfExaminatedField = this.fields.getEncirclingFieldsByField(field)
        const atLeastTwoHumanFieldsInNeighborhood = neighboringFieldsOfExaminatedField.filter(x => x.player === this.currentPlayer.playerId).length >= 2
        const atLeastOneHumanTownhallInNeighborhood = neighboringFieldsOfExaminatedField.filter(x => x.player === this.currentPlayer.playerId && x.typeField === filemapSettings.townhall).length >= 1
        if (this.currentPlayer.troops > 0) {
          if (fieldExistInNeighborhood) {
            if (atLeastTwoHumanFieldsInNeighborhood || atLeastOneHumanTownhallInNeighborhood) {
              if (this.attack(field)) {
                this.rightPanel.updateTroopsAmount(this.currentPlayer.troops)
                const tile = this.map.getTileAt(field.x, field.y);
                if (tile) {
                  this.fadingNumber = new FadingNumber(this, tile.pixelX * this.scaleFactor + this.centralPanelX, tile.pixelY * this.scaleFactor, '0');
                  this.fadingNumber.displayNumber(field.resistance);
                }
              }
            }

          }
          else {
            this.createPopup("The attacked field must be adjacent.");
          }

        }
        else {
          this.createPopup("Not enough troops, build barrack first.");
        }
      }
      else {
        this.createPopup("This player is on your team.");
      }
    }

    else {
      this.createPopup("Not enough action points to attack.");
    }
  }

  leaveField(field: Field) {
    if (this.currentPlayer.actionPoints >= gameSettings.fieldLeaveAPCost) {
      if (field.player === this.currentPlayer.playerId) {
        if (this.fields.getPlayerFields(this.currentPlayer.playerId)
          .filter(x => x.typeField === filemapSettings.townhall).length > 1) {
          field.player = null;
          field.occupied = false;
          this.refreshFogOfWar();
        }
        else {
          this.createPopup("You cannot leave the place with the last town hall.")
        }
      }
    }
    else {
      this.createPopup("Not enough action points to leave field.")
    }
  }

  /**
   * When townhall destroyed it is possible that it was last player townhall - and this is end of the game for him.
   * In this scenario:
   * - player is removed from list of active players, 
   * - he lose all his fields (but buildings remained),
   */
  townhallDestroyed(field: Field) {
    let examinatedPlayer = this.players.find(x => x.playerId === field.player);
    if (examinatedPlayer) {
      let examinatedPlayerFields = this.fields.getPlayerFields(examinatedPlayer.playerId);
      let ts = examinatedPlayerFields.filter(x => x.typeField === filemapSettings.townhall);
      if (ts.length === 1) {
        if (ts[0].x === field.x && ts[0].y === field.y) {
          examinatedPlayer.isActive = false;
          examinatedPlayerFields.map(x => x.player = null)

          if (examinatedPlayer.isHuman) {
            this.createPopup("You Lost!");
            this.time.delayedCall(3000, () => this.scene.start("WelcomeScene", { p: 0, selectedMap: "" }));
          }
          else {
            this.createPopup(examinatedPlayer.name + " eliminated.")
          }
        }
      }
    }
  }

  /**
   * We have 2 types of fog:
   * 1) Initial - when human player never discover the field yet,
   * 2) Temporary - when human player lost some field - but already knew how is it look
   */
  refreshFogOfWar() {
    let p = this.players.find(x => x.isHuman)
    if (p) {
      let currentVisibleFields: Field[] = []
      let team = this.players.filter(x => x.team === p?.team)
      if (team) {
        team.forEach(player => {
          let cvf = this.fields.listPlayerFieldsAndNeighboringFieldsInRange(player.playerId, 1)
          currentVisibleFields = currentVisibleFields.concat(cvf)
        })

        this.fields.forEach(field => {
          let tile = this.map.getTileAt(field.x, field.y)
          if (tile !== null) {
            if (currentVisibleFields.includes(field)) {
              field.initialFogOfWar = false;
              field.temporaryFogOfWar = false;
              tile.setAlpha(0.9);
            }
            else {
              field.temporaryFogOfWar = true;
              tile.setAlpha(0);
            }
            if (field.temporaryFogOfWar && !field.initialFogOfWar) {
              tile.setAlpha(0.4);
            }
          }
        })
      }

    }
  }

  attack(field: Field): boolean {
    if (!this.fields.get(field.y, field.x).blocked) {
      this.currentPlayer.increaseExperience(gameSettings.fieldAttack);
      this.currentPlayer.descreaseTroops(1);
      this.currentPlayer.descreaseActionPoints(gameSettings.fieldAttackAPCost);

      if (field.typeField !== filemapSettings.blank && field.typeField !== filemapSettings.goldDeposit) {
        if (field.resistance > 1) {
          field.resistance = field.resistance - 1;
        }
        else {
          let tile = this.map.getTileAt(field.x, field.y);
          if (field.typeField === filemapSettings.townhall) this.townhallDestroyed(field);
          if (field.typeField === filemapSettings.mine && field.isGoldDeposit) {
            field.typeField = filemapSettings.goldDeposit;
            if (tile) tile.index = filemapSettings.goldDeposit;
          }
          else {
            field.typeField = filemapSettings.blank;
            if (tile) tile.index = filemapSettings.blank;
          }
          field.resistance = 1;
          this.refreshFogOfWar();
        }
      }
      else {
        field.player = this.currentPlayer.playerId;
        field.occupied = true;

        this.fields.set(field.y, field.x, field);
        this.currentPlayer.increaseExperience(gameSettings.fieldTakeover);
        const xs = this.fields.listNeighboringFieldsThatCanBeAnnexed(field.player, field);
        for (let x of xs) {
          x.player = this.currentPlayer.playerId
          x.occupied = true
          this.fields.set(x.y, x.x, x);
          this.currentPlayer.increaseExperience(gameSettings.fieldTakeover);
        }
        this.refreshFogOfWar();
      }
      return true
    }
    else {
      this.createPopup("This field is blocked.")
      return false
    }
  }

  calculateAmountOfPlayerGold(): number {
    const fieldsWithGold = this.fields.getPlayerFields(this.currentPlayer.playerId)
      .filter(x => x.typeField === filemapSettings.mine)

    return gameSettings.goldGainPerRound +
      (fieldsWithGold.filter(x => !x.isGoldDeposit).length * gameSettings.goldGainPerRoundForMine) +
      (fieldsWithGold.filter(x => x.isGoldDeposit).length * gameSettings.goldGainPerRoundForMineOnDeposit)
  }



  nextTurn() {
    let activePlayers = this.players.filter(x => x.isActive)
    if (activePlayers.length > 1 && this.distinctList(activePlayers.map(x => x.team)).length > 1) {
      this.currentPlayer.increaseGold(this.calculateAmountOfPlayerGold());
      let innerFieldsByPlayer = this.fields.getInnerFieldsByPlayer(this.currentPlayer.playerId);
      let outerFieldsByPlayer = this.fields.getOuterFieldsByPlayer(this.currentPlayer.playerId);

      this.currentPlayer.increaseActionPoints(innerFieldsByPlayer.length, outerFieldsByPlayer.length,
        this.fields.getPlayerFields(this.currentPlayer.playerId).filter(x => x.typeField === filemapSettings.townhall).length - 1)


      let activePlayers = this.players.filter(x => x.isActive);
      let currentPlayerIndex = activePlayers.indexOf(this.currentPlayer);
      // change Player
      if (currentPlayerIndex + 1 === activePlayers.length) {
        this.currentPlayer = activePlayers[0]
      }
      else {
        const nextPlayer = activePlayers[currentPlayerIndex + 1];
        if (nextPlayer) {
          this.currentPlayer = nextPlayer
        }
      }
    }
    else {
      this.createPopup("You Win!");
      this.time.delayedCall(3000, () => this.scene.start("WelcomeScene", { p: 0, selectedMap: "" }));
    }
  }

  buildBarrack(field: Field = this.selectedField.field): boolean {
    if (this.isCurrentPlayerTerritory(field) && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)) {
      if (this.currentPlayer.actionPoints >= gameSettings.barrackActionPointCost && this.currentPlayer.gold >= gameSettings.barrackGoldCost) {
        field.typeField = filemapSettings.barrack;
        field.resistance = gameSettings.barrackResistance;
        this.map.putTileAt(filemapSettings.barrack, field.x, field.y, true, 0);
        this.currentPlayer.descreaseGold(gameSettings.barrackGoldCost);
        let barracks = this.fields.getPlayerFields(this.currentPlayer.playerId).filter(x => x.typeField === filemapSettings.barrack);
        let troopsAmount = gameSettings.barrackProductivity +
          (barracks.filter(x => x.resistance == 2).length * gameSettings.barrackProductivityAlreadyOwnedBarracks) +
          (barracks.filter(x => x.resistance == 1).length * gameSettings.barrackProductivityAlreadyOwnedDamagedBarracks)
        this.currentPlayer.increaseTroops(troopsAmount);
        this.currentPlayer.descreaseActionPoints(gameSettings.barrackActionPointCost);
        this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
        return true
      }
      else {
        if (!this.currentPlayer.isHuman) this.nextTurn();
        return false
      }
    }
    else {
      return false
    }

  }

  createPopup(text: string) {
    let popup = new Popup(this, this.sceneWidth / 4, this.sceneHeight / 4, "panel_beige", text);

    popup.setScale(this.scaleFactor);
    this.add.container(0, 0, popup);
    this.time.delayedCall(3000, () => popup.destroy());
  }

  isCurrentPlayerTerritory(field: Field) {
    if (field.player === this.currentPlayer.playerId) {
      return true
    }
    else {
      this.createPopup("You can only build mines on your territory.");
      return false
    }
  }

  buildMine(field: Field = this.selectedField.field) {
    if (this.isCurrentPlayerTerritory(field) && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)) {
      if (this.currentPlayer.actionPoints >= gameSettings.mineActionPointCost) {
        if (this.currentPlayer.gold >= gameSettings.mineGoldCost) {
          field.typeField = filemapSettings.mine;
          field.resistance = gameSettings.mineResistance;
          this.map.putTileAt(filemapSettings.mine, field.x, field.y, true, 0);
          this.currentPlayer.descreaseGold(gameSettings.mineGoldCost);
          this.currentPlayer.descreaseActionPoints(gameSettings.mineActionPointCost);
          this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
        } else {
          this.createPopup("You can't build a mine. Not enough gold.");
        }
      }
      else {
        this.createPopup("You can't build a mine. Not enough action points.");
      }
    }
  }

  buildWoodenWall(field: Field = this.selectedField.field) {
    if (this.isCurrentPlayerTerritory(field) && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)) {
      if (this.currentPlayer.actionPoints >= gameSettings.woodenWallActionPointCost) {
        if (this.currentPlayer.gold >= gameSettings.woodenWallGoldCost) {
          field.typeField = filemapSettings.woodenWall;
          field.resistance = gameSettings.woodenWallResistance;
          this.map.putTileAt(filemapSettings.woodenWall, field.x, field.y, true, 0);
          this.currentPlayer.descreaseGold(gameSettings.woodenWallGoldCost);
          this.currentPlayer.descreaseActionPoints(gameSettings.woodenWallActionPointCost);
          this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
        } else {
          this.createPopup("You can't build a wooden wall. Not enough gold.");
        }
      }
      else {
        this.createPopup("You can't build a wooden wall. Not enough action points.");
      }
    }
  }

  buildStoneWall(field: Field = this.selectedField.field) {
    if (this.isCurrentPlayerTerritory(field) && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)) {
      if (this.currentPlayer.actionPoints >= gameSettings.stoneWallActionPointCost) {
        if (this.currentPlayer.gold >= gameSettings.stoneWallGoldCost) {
          field.typeField = filemapSettings.stoneWall;
          field.resistance = gameSettings.stoneWallResistance;
          this.map.putTileAt(filemapSettings.stoneWall, field.x, field.y, true, 0);
          this.currentPlayer.descreaseGold(gameSettings.stoneWallGoldCost);
          this.currentPlayer.descreaseActionPoints(gameSettings.stoneWallActionPointCost);
          this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
        } else {
          this.createPopup("You can't build a stone wall. Not enough gold.");
        }
      }
      else {
        this.createPopup("You can't build a stone wall. Not enough action points.");
      }
    }
  }

  buildTownhall(field: Field = this.selectedField.field) {
    if (this.isCurrentPlayerTerritory(field) && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)) {
      if (this.currentPlayer.actionPoints >= gameSettings.townhallActionPointCost && this.currentPlayer.gold >= gameSettings.townhallGoldCost) {
        field.typeField = filemapSettings.townhall;
        field.resistance = gameSettings.townhallResistance;
        this.map.putTileAt(filemapSettings.townhall, field.x, field.y, true, 0);
        this.currentPlayer.descreaseGold(gameSettings.townhallGoldCost);
        this.currentPlayer.descreaseActionPoints(gameSettings.townhallActionPointCost);
        this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
      }
      else {
        this.createPopup("CANNOT BUILD Townhall!");
      }
    }
  }

  handleHumanMove() {
    this.rightPanel.showPlayerActionsAndBuilding(true);
    //this.nextTurn(); // -> For testing uncomment this line to omit human move

  }

  updateHumanInfo() {
    this.rightPanel.updateActionPoints(this.currentPlayer.actionPoints, this.currentPlayer.actionPointsLimit);
    this.rightPanel.updateTroopsAmount(this.currentPlayer.troops);
    this.rightPanel.updateGoldAmount(this.currentPlayer.gold);
    this.rightPanel.updateExperience(this.currentPlayer.experience);
    this.rightPanel.updateControlledLand(this.fields.getPlayerFields(this.currentPlayer.playerId).length);
  }


  handleBotMove() {
    this.rightPanel.showPlayerActionsAndBuilding(false);
    const currentActionPoints = this.currentPlayer.actionPoints
    const playerFieldsFlatten = this.fields.getPlayerFields(this.currentPlayer.playerId);
    const blankPlayerFields = playerFieldsFlatten.filter(x => x.typeField === filemapSettings.blank);
    const freeGoldDeposits = playerFieldsFlatten.filter(x => x.typeField === filemapSettings.goldDeposit);
    if (this.currentPlayer.troops === 0 && blankPlayerFields.length > 0) {
      this.buildBarrack(blankPlayerFields[0]);
    }
    else if (this.currentPlayer.actionPoints >= gameSettings.townhallActionPointCost &&
      this.currentPlayer.gold >= gameSettings.townhallGoldCost &&
      blankPlayerFields.length > 0) {
      this.buildTownhall(blankPlayerFields[0]);
    }
    else if (freeGoldDeposits.length > 0 &&
      this.currentPlayer.actionPoints >= gameSettings.mineActionPointCost &&
      this.currentPlayer.gold >= gameSettings.mineGoldCost) {
      this.buildMine(freeGoldDeposits[0]);
    }
    else {
      this.getPossibleFieldsToAttack();
    }
    if (currentActionPoints === this.currentPlayer.actionPoints) {
      // bot not able to do any move - end turn
      this.nextTurn();
    }
  }

  nextMove() {
    if (this.currentPlayer.actionPoints > 0) {
      if (this.currentPlayer.isHuman) {
        this.updateHumanInfo();
        this.handleHumanMove();
      } else {
        this.handleBotMove();
      }
    } else {
      if (this.currentPlayer.isHuman) {
        this.updateHumanInfo();
      }
      else this.nextTurn();
    }

    this.leftPanel.updatePlayerList(this.players, this.currentPlayer.playerId);
  }

  updateSelectedField(x, y) {
    this.selectedField.clearGraphics();
    let g = this.createTileOutline(x, y)
    this.selectedField = new SelectedField(this.fields.get(y, x), g)
  }

  update(time: number): void {
    if (this.borders !== undefined) {
      this.borders?.destroy();
      this.borders = undefined;
    }
    this.drawBorders();

    if (this.timeSinceLastIncrement + (this.cameras.main.width * 0.25, this.cameras.main.height * 0.3333333333333333) < this.game.getTime()) {
      this.timeSinceLastIncrement = this.game.getTime();
      this.nextMove();
    }

    this.input.on('pointerup', function (pointer) {
      if (pointer.worldX > this.mapLayerX && pointer.worldX < this.rightPanelX) {
        let tile: Phaser.Tilemaps.Tile = this.map.getTileAtWorldXY(pointer.worldX, pointer.worldY);
        this.updateSelectedField(tile.x, tile.y);
      }


    }, this);

    if (this.input.keyboard && this.selectedField !== undefined && this.currentPlayer.isHuman) {
      let cursors = this.input.keyboard.createCursorKeys();
      let attackKey = this.input.keyboard.addKey('A');
      let finishKey = this.input.keyboard.addKey('F');
      let leaveKey = this.input.keyboard.addKey('L');
      let buildTownhallKey = this.input.keyboard.addKey('T');
      let buildBarrackKey = this.input.keyboard.addKey('B');
      let buildMineKey = this.input.keyboard.addKey('M');
      let buildObserwationTowerKey = this.input.keyboard.addKey('O');
      let buildWoodenWallKey = this.input.keyboard.addKey('W');
      let buildStoneWallKey = this.input.keyboard.addKey('S');


      if (cursors.down.isDown) {
        cursors.down.isDown = false;
        if (this.selectedField.field.y < gameSettings.mapSizeY - 1) {
          this.updateSelectedField(this.selectedField.field.x, this.selectedField.field.y + 1);
        }
      }
      else if (cursors.up.isDown) {
        cursors.up.isDown = false;
        if (this.selectedField.field.y > 0) {
          this.updateSelectedField(this.selectedField.field.x, this.selectedField.field.y - 1);
        }
      }
      else if (cursors.right.isDown) {
        cursors.right.isDown = false;
        if (this.selectedField.field.x < gameSettings.mapSizeX - 1) {
          this.updateSelectedField(this.selectedField.field.x + 1, this.selectedField.field.y);
        }
      }
      else if (cursors.left.isDown) {
        cursors.left.isDown = false;
        if (this.selectedField.field.x > 0) {
          this.updateSelectedField(this.selectedField.field.x - 1, this.selectedField.field.y);
        }
      }

      if (attackKey.isDown) {
        attackKey.isDown = false
        this.humanAttack(this.selectedField.field);
      }
      if (leaveKey.isDown) {
        leaveKey.isDown = false
        this.leaveField(this.selectedField.field);
      }
      if (finishKey.isDown) {
        finishKey.isDown = false
        this.nextTurn();
      }
      if (buildTownhallKey.isDown) {
        buildTownhallKey.isDown = false
        this.buildTownhall();
      }
      if (buildBarrackKey.isDown) {
        buildBarrackKey.isDown = false
        this.buildBarrack();
      }
      if (buildMineKey.isDown) {
        buildMineKey.isDown = false
        this.buildMine();
      }
      if (buildObserwationTowerKey.isDown) {
        buildObserwationTowerKey.isDown = false
        // TODO
      }
      if (buildWoodenWallKey.isDown) {
        buildWoodenWallKey.isDown = false
        this.buildWoodenWall();
      }
      if (buildStoneWallKey.isDown) {
        buildStoneWallKey.isDown = false
        this.buildStoneWall();
      }
    }
  }

};
