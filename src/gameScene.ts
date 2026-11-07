import 'phaser';

import { Actions } from './actions';
import { chooseFrontierBuildField, chooseSafestBuildField, rankAttackTargets } from './botStrategy';
import { FadingNumber } from './components/fadingNumber';
import { Popup } from './components/popup';
import { RoutingButton } from './components/routingButton';
import Field from './field';
import Fields from './fields';
import GameMode, { deathmatch } from './gameMode';
import { clearGameSnapshot, GAME_SAVE_VERSION, GameSnapshot, isGameSnapshot, writeGameSnapshot } from './gameSave';
import LeftMenu from './menus/leftMenu';
import RightMenu from './menus/rightMenu';
import Player from './player';
import SelectedField from './selectedField';
import * as filemapSettings from './settings/filemapSettings';
import * as gameSettings from './settings/gameSettings';



export class GameScene extends Phaser.Scene {
  delta: number;
  info: Phaser.GameObjects.Text;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  leftPanel: LeftMenu;
  rightPanel: RightMenu;
  newScale: number = 1
  rightPanelX: number = 0;
  centralPanelX: number = 0;
  mapLayerX: number = 0
  mapLayerRight: number = 0
  leftPanelX: number = 0
  leftPanelY: number = 0
  leftPanelWidth: number = 0
  rightPanelWidth: number = 0
  panelHeight: number = 0
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
  tilemapY = 0
  selectedGameMode: GameMode = deathmatch
  rightPanelToggle: Phaser.GameObjects.Text
  leftPanelToggle: Phaser.GameObjects.Text
  roundNumber: number = 1
  uiPaused: boolean = false
  gameEnded: boolean = false
  modalOverlay: Phaser.GameObjects.Container | undefined
  pendingSnapshot: GameSnapshot | undefined

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(data): void {
    this.delta = 1000;
    this.gameEnded = false;
    this.uiPaused = false;
    this.modalOverlay = undefined;
    this.roundNumber = 1;
    this.timeSinceLastIncrement = 0;
    this.pendingSnapshot = isGameSnapshot(data?.snapshot) ? data.snapshot : undefined;
    if (this.pendingSnapshot) {
      this.selectedMap = this.pendingSnapshot.selectedMap;
      this.numberOfPlayers = this.pendingSnapshot.numberOfPlayers;
      const mode = this.pendingSnapshot.selectedGameMode;
      this.selectedGameMode = new GameMode(mode.numberOfTeams, mode.playersPerTeams, mode.name);
    } else {
      this.selectedMap = data.selectedMap;
      this.numberOfPlayers = data.numberOfPlayers;
      this.selectedGameMode = data.selectedGameMode;
    }
  }

  preload(): void {
    this.load.setBaseURL(".");
    this.load.image("eft_filemap", "assets/eft_filemap-v2.png");
    this.load.image("menu_item", "assets/buttonLong_brown.png");
    this.load.image("background2", "assets/backgroundColorFall.png");
    this.load.image("tilemap_border", "assets/buttonSquare_brown_pressed.png");
    this.load.image("panel_beige", "assets/panel_beige.png");
    this.load.tilemapCSV('map', 'assets/' + this.selectedMap + '.csv')
  }



  createLeftPanel() {
    this.leftPanel = new LeftMenu(this, this.leftPanelX, this.leftPanelY, this.leftPanelWidth, this.panelHeight, this.players);
    this.leftPanel.setDepth(30);
  }

  performAction(name: Actions) {
    switch (name) {
      case Actions.Townhall: {
        this.buildTownhall();
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
      case Actions.ObservationTower: {
        this.buildObservationTower();
        break;
      }
      case Actions.Repair: {
        this.repairBuilding();
        break;
      }
      case Actions.Demolish: {
        this.demolishBuilding();
        break;
      }
      case Actions.TransferGold: {
        this.transferGold();
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
    let f = new Array<Array<Field>>();

    for (let y = 0; y < 20; y++) {
      let row: Field[] = new Array<Field>();
      for (let x = 0; x < 20; x++) {
        let tile = this.map.getTileAt(x, y)


        switch (tile?.index) {
          case filemapSettings.townhall: {
            row.push(new Field(x, y, true, false, null, filemapSettings.townhall, false, gameSettings.townhallResistance));
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
            row.push(new Field(x, y, false, false, null, filemapSettings.woodenWall, false, gameSettings.woodenWallResistance));
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
    const startingTownhalls: Field[] = [];
    this.fields.forEach(field => {
      if (field.typeField === filemapSettings.townhall) startingTownhalls.push(field);
    });
    this.shuffleList(startingTownhalls).forEach((field, index) => {
      if (index < this.numberOfPlayers) field.player = index;
    });

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
    playersInTeams = this.selectedGameMode === deathmatch
      ? Array.from({ length: this.numberOfPlayers }, (_, index) => index + 1)
      : this.shuffleList(playersInTeams)

    const humanPlayerIndex = Math.floor(Math.random() * this.numberOfPlayers);
    this.players = new Array<Player>();
    for (let i = 0; i < this.numberOfPlayers; i++) {
      const team = this.selectedGameMode === deathmatch ? playersInTeams[i] : playersInTeams.pop();
      const player = i === humanPlayerIndex ? new Player(i, team, names[i], true) : new Player(i, team, names[i])
      this.players.push(player)
    }
    let p = this.players.find(x => x.isHuman)
    if (p) {
      this.currentPlayer = p;
      let fields = this.fields.getPlayerFields(p.playerId);
      this.refreshFogOfWar();
      this.selectedField = new SelectedField(fields[0], undefined);
    }
  }

  private restoreSnapshot(snapshot: GameSnapshot): boolean {
    const expectedFields = gameSettings.mapSizeX * gameSettings.mapSizeY;
    const validCoordinates = snapshot.fields.every(field =>
      field.x >= 0 && field.x < gameSettings.mapSizeX && field.y >= 0 && field.y < gameSettings.mapSizeY
    );
    const validSelection = snapshot.selectedField.x >= 0 && snapshot.selectedField.x < gameSettings.mapSizeX &&
      snapshot.selectedField.y >= 0 && snapshot.selectedField.y < gameSettings.mapSizeY;
    if (snapshot.fields.length !== expectedFields || !validCoordinates || !validSelection) return false;

    const restoredPlayers = snapshot.players.map(saved => {
      const player = new Player(saved.playerId, saved.team, saved.name, saved.isHuman, saved.color, saved.gold, saved.troops, saved.isActive);
      player.actionPointsLimit = saved.actionPointsLimit;
      player.actionPoints = saved.actionPoints;
      player.experience = saved.experience;
      player.failedAttacksReceived = saved.failedAttacksReceived;
      return player;
    });
    const restoredCurrentPlayer = restoredPlayers.find(player => player.playerId === snapshot.currentPlayerId);
    const restoredSelection = this.fields.get(snapshot.selectedField.y, snapshot.selectedField.x);
    if (!restoredCurrentPlayer || !restoredSelection) return false;

    snapshot.fields.forEach(saved => {
      const field = this.fields.get(saved.y, saved.x);
      field.player = saved.player;
      field.occupied = saved.occupied;
      field.blocked = saved.blocked;
      field.typeField = saved.typeField;
      field.resistance = saved.resistance;
      field.isGoldDeposit = saved.isGoldDeposit;
      field.initialFogOfWar = saved.initialFogOfWar;
      field.temporaryFogOfWar = saved.temporaryFogOfWar;
      this.map.putTileAt(saved.typeField, saved.x, saved.y, true, 0);
    });

    this.players = restoredPlayers;
    this.currentPlayer = restoredCurrentPlayer;
    this.roundNumber = snapshot.roundNumber;
    this.selectedField = new SelectedField(restoredSelection, undefined);
    this.refreshFogOfWar();
    return true;
  }

  private createSnapshot(): GameSnapshot {
    const fields: GameSnapshot["fields"] = [];
    this.fields.forEach(field => fields.push({
      player: field.player,
      occupied: field.occupied,
      blocked: field.blocked,
      x: field.x,
      y: field.y,
      typeField: field.typeField,
      resistance: field.resistance,
      isGoldDeposit: field.isGoldDeposit,
      initialFogOfWar: field.initialFogOfWar,
      temporaryFogOfWar: field.temporaryFogOfWar
    }));

    return {
      version: GAME_SAVE_VERSION,
      savedAt: new Date().toISOString(),
      selectedMap: this.selectedMap,
      numberOfPlayers: this.numberOfPlayers,
      selectedGameMode: {
        numberOfTeams: this.selectedGameMode.numberOfTeams,
        playersPerTeams: this.selectedGameMode.playersPerTeams,
        name: this.selectedGameMode.name
      },
      roundNumber: this.roundNumber,
      currentPlayerId: this.currentPlayer.playerId,
      selectedField: { x: this.selectedField.field.x, y: this.selectedField.field.y },
      players: this.players.map(player => ({
        playerId: player.playerId,
        color: player.color,
        gold: player.gold,
        troops: player.troops,
        actionPointsLimit: player.actionPointsLimit,
        actionPoints: player.actionPoints,
        isHuman: player.isHuman,
        isActive: player.isActive,
        experience: player.experience,
        team: player.team,
        name: player.name,
        failedAttacksReceived: player.failedAttacksReceived
      })),
      fields
    };
  }

  private saveCurrentGame(showFeedback: boolean = true): boolean {
    if (!this.fields || !this.currentPlayer || !this.selectedField || this.gameEnded) return false;
    const saved = writeGameSnapshot(this.createSnapshot());
    if (showFeedback) this.createPopup(saved ? "Game saved." : "The browser could not save this game.");
    return saved;
  }

  createRigthPanel() {
    const bindedAction = this.performAction.bind(this);
    const panelScale = Math.min(1, this.panelHeight / 660);
    this.rightPanel = new RightMenu(this, this.rightPanelX, this.leftPanelY, this.rightPanelWidth / panelScale, this.panelHeight / panelScale, bindedAction, () => this.showPauseMenu());
    this.rightPanel.setScale(panelScale);
    this.rightPanel.setDepth(30);
    if (this.sceneWidth < 960) {
      this.rightPanel.setVisible(false);
      this.rightPanelToggle = this.add.text(this.sceneWidth - 12, 12, "Actions ☰", {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        color: "#f7e7c8",
        backgroundColor: "#203c3b",
        padding: { x: 10, y: 7 }
      }).setOrigin(1, 0).setDepth(300).setInteractive({ useHandCursor: true });
      this.rightPanelToggle.on("pointerdown", () => {
        const visible = !this.rightPanel.visible;
        this.rightPanel.setVisible(visible);
        this.rightPanelToggle.setText(visible ? "Close ×" : "Actions ☰");
      });
    }
  }

  create(): void {
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;
    const margin = 14;
    const gap = 14;
    this.panelHeight = this.sceneHeight - margin * 2;
    const compact = this.sceneWidth < 960;
    this.leftPanelWidth = compact ? Math.min(250, this.sceneWidth - margin * 2) : Phaser.Math.Clamp(this.sceneWidth * 0.18, 210, 250);
    this.rightPanelWidth = compact ? Math.min(this.sceneWidth - margin * 2, Phaser.Math.Clamp(this.sceneWidth * 0.35, 270, 320)) : Phaser.Math.Clamp(this.sceneWidth * 0.23, 300, 350);
    this.leftPanelX = margin;
    this.leftPanelY = margin;
    this.rightPanelX = this.sceneWidth - margin - this.rightPanelWidth;

    const boardAreaLeft = compact ? margin : this.leftPanelX + this.leftPanelWidth + gap;
    const boardAreaRight = compact ? this.sceneWidth - margin : this.rightPanelX - gap;
    const availableBoardWidth = boardAreaRight - boardAreaLeft;
    const boardSize = Math.max(120, Math.min(this.panelHeight, availableBoardWidth));
    this.centralPanelX = boardAreaLeft + Math.max(0, (availableBoardWidth - boardSize) / 2);
    this.tilemapY = margin + Math.max(0, (this.panelHeight - boardSize) / 2);
    this.mapLayerX = this.centralPanelX;
    this.mapLayerRight = this.centralPanelX + boardSize;
    this.newScale = boardSize / (filemapSettings.tileWidth * gameSettings.mapSizeX);

    this.add.sprite(0, 0, 'background2').setOrigin(0).setDisplaySize(this.sceneWidth, this.sceneHeight).setTint(0x476a67).setAlpha(0.22);
    this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, 0x07191a, 0.78);
    this.add.rectangle(this.centralPanelX + boardSize / 2 + 5, this.tilemapY + boardSize / 2 + 7, boardSize + 14, boardSize + 14, 0x000000, 0.35).setDepth(1);
    this.add.rectangle(this.centralPanelX + boardSize / 2, this.tilemapY + boardSize / 2, boardSize + 8, boardSize + 8, 0x102921, 1)
      .setStrokeStyle(3, 0xc18b4e, 0.95).setDepth(2);
    const boardGrid = this.add.graphics().setDepth(2);
    const gridStep = boardSize / gameSettings.mapSizeX;
    boardGrid.lineStyle(1, 0x53736b, 0.18);
    for (let index = 1; index < gameSettings.mapSizeX; index++) {
      const offset = index * gridStep;
      boardGrid.lineBetween(this.centralPanelX + offset, this.tilemapY, this.centralPanelX + offset, this.tilemapY + boardSize);
      boardGrid.lineBetween(this.centralPanelX, this.tilemapY + offset, this.centralPanelX + boardSize, this.tilemapY + offset);
    }

    this.map = this.make.tilemap({ key: 'map', tileWidth: filemapSettings.tileWidth, tileHeight: filemapSettings.tileHeight });
    let tileset = this.map.addTilesetImage('eft_filemap', undefined, filemapSettings.tileWidth, filemapSettings.tileHeight, -2, -2);

    if (tileset) {
      this.tileset = tileset;
      let layer = this.map.createLayer(0, this.tileset, this.centralPanelX, this.tilemapY);

      if (layer) {
        layer.setScale(this.newScale);
        layer.setAlpha(1);
        layer.setDepth(3);
      }
    }

    this.initializeFields();
    this.initializePlayers();
    if (this.pendingSnapshot && !this.restoreSnapshot(this.pendingSnapshot)) {
      clearGameSnapshot();
      this.pendingSnapshot = undefined;
    }
    this.createLeftPanel();
    if (compact) {
      this.leftPanel.setVisible(false).setDepth(250);
      this.leftPanelToggle = this.add.text(12, 12, "☰ Players", {
        fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#f7e7c8", backgroundColor: "#203c3b", padding: { x: 10, y: 7 }
      }).setDepth(300).setInteractive({ useHandCursor: true });
      this.leftPanelToggle.on("pointerdown", () => {
        const visible = !this.leftPanel.visible;
        this.leftPanel.setVisible(visible);
        this.leftPanelToggle.setText(visible ? "× Close" : "☰ Players");
      });
    }
    this.createRigthPanel();
    this.rightPanel.updateCurrentPlayer(this.currentPlayer.name, this.currentPlayer.team, this.currentPlayer.isHuman, this.roundNumber);
    this.updateHumanInfo();
    this.updateSelectedField(this.selectedField.field.x, this.selectedField.field.y);
    this.setupInput();
    this.saveCurrentGame(false);

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
      graphics.setScale(this.newScale, this.newScale)
      graphics.setX(this.centralPanelX)
      graphics.setY(this.tilemapY);
      graphics.setDepth(20);
      return graphics
    }
  }

  private isOrthogonallyAdjacent(a: Field, b: Field): boolean {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  }

  private canCurrentPlayerAttack(field: Field): boolean {
    const neighbors = this.fields.getEncirclingFieldsByField(field);
    const ownedNeighbors = neighbors.filter(x => x.player === this.currentPlayer.playerId);
    const hasSharedEdge = ownedNeighbors.some(x => this.isOrthogonallyAdjacent(x, field));
    const hasAdjacentTownhall = ownedNeighbors.some(x =>
      x.typeField === filemapSettings.townhall && this.isOrthogonallyAdjacent(x, field)
    );
    return hasSharedEdge && (ownedNeighbors.length >= 2 || hasAdjacentTownhall);
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

          this.borders.setScale(this.newScale, this.newScale);
          this.borders.setX(this.centralPanelX);
          this.borders.setY(this.tilemapY);
          this.borders.setDepth(12);
        }
      }
    }
  }

  private tryBotAttack(): boolean {
    if (this.currentPlayer.troops <= 0 || this.currentPlayer.actionPoints < gameSettings.fieldAttackAPCost) {
      return false;
    }
    const alliedIds = this.players
      .filter(player => player.team === this.currentPlayer.team)
      .map(player => player.playerId);
    const candidates = rankAttackTargets(
      this.fields.getNeighboringFieldsByPlayer(this.currentPlayer.playerId),
      alliedIds
    ).filter(field => this.canCurrentPlayerAttack(field));
    const target = candidates[0];
    return target ? this.attack(target) : false;
  }

  private countBotFrontierNeighbors(field: Field): number {
    const alliedIds = this.players
      .filter(player => player.team === this.currentPlayer.team)
      .map(player => player.playerId);
    return this.fields.getEncirclingFieldsByField(field)
      .filter(neighbor => this.isOrthogonallyAdjacent(field, neighbor))
      .filter(neighbor => !neighbor.blocked && (neighbor.player === null || !alliedIds.includes(neighbor.player)))
      .length;
  }

  humanAttack(field: Field) {
    if (this.currentPlayer.actionPoints >= gameSettings.fieldAttackAPCost) {
      let team: Number[] = this.players.filter(x => x.team === this.currentPlayer.team).map(x => x.playerId)
      let blockFriendlyField: boolean = field.player !== null ? team.includes(field.player) : false
      if (!blockFriendlyField) {
        const fieldExistInNeighborhood = this.fields.getNeighboringFieldsByPlayer(this.currentPlayer.playerId)
          .find(f => f.x === field.x && f.y === field.y)
        if (this.currentPlayer.troops > 0) {
          if (fieldExistInNeighborhood) {
            if (this.canCurrentPlayerAttack(field)) {
              if (this.attack(field)) {
                this.rightPanel.updateTroopsAmount(this.currentPlayer.troops)
                const tile = this.map.getTileAt(field.x, field.y);
                if (tile) {
                  this.fadingNumber = new FadingNumber(this, tile.pixelX * this.newScale + this.centralPanelX, tile.pixelY * this.newScale, '0');
                  this.fadingNumber.displayNumber(field.resistance);
                }
              }
            } else {
              this.createPopup("Attack requires a shared edge and two neighboring fields (or a townhall).")
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
        const townhalls = this.fields.getPlayerFields(this.currentPlayer.playerId)
          .filter(x => x.typeField === filemapSettings.townhall);
        if (field.typeField !== filemapSettings.townhall || townhalls.length > 1) {
          field.player = null;
          field.occupied = false;
          this.currentPlayer.descreaseActionPoints(gameSettings.fieldLeaveAPCost);
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
  townhallDestroyed(field: Field): boolean {
    let examinatedPlayer = this.players.find(x => x.playerId === field.player);
    if (examinatedPlayer) {
      let examinatedPlayerFields = this.fields.getPlayerFields(examinatedPlayer.playerId);
      let ts = examinatedPlayerFields.filter(x => x.typeField === filemapSettings.townhall);
      if (ts.length === 1) {
        if (ts[0].x === field.x && ts[0].y === field.y) {
          examinatedPlayer.isActive = false;
          examinatedPlayerFields.map(x => x.player = null)

          if (examinatedPlayer.isHuman) {
            this.showEndGameOverlay(false, "Defeat", "Your final townhall has been destroyed.");
          }
          else {
            this.createPopup(examinatedPlayer.name + " eliminated.")
          }
          const remainingTeams = this.distinctList(this.players.filter(player => player.isActive).map(player => player.team));
          const humanPlayer = this.players.find(player => player.isHuman);
          if (!this.gameEnded && remainingTeams.length === 1 && humanPlayer?.isActive && remainingTeams[0] === humanPlayer.team) {
            this.showEndGameOverlay(true, "Victory", "The final opposing townhall has fallen.");
          }
          return true;
        }
      }
    }
    return false;
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
          this.fields.getPlayerFields(player.playerId)
            .filter(field => field.typeField === filemapSettings.observationTower)
            .forEach(tower => {
              const range = tower.resistance < gameSettings.observationTowerResistance
                ? gameSettings.damagedObservationTowerVisionRange
                : gameSettings.observationTowerVisionRange;
              currentVisibleFields.push(tower, ...this.fields.listNeighboringFieldsInRange(range, tower));
            });
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
      const defendingPlayer = field.player === null ? undefined : this.players.find(x => x.playerId === field.player);
      const attackedType = field.typeField;
      this.currentPlayer.increaseExperience(gameSettings.fieldAttack);
      this.currentPlayer.descreaseTroops(1);
      this.currentPlayer.descreaseActionPoints(gameSettings.fieldAttackAPCost);

      if (field.typeField !== filemapSettings.blank && field.typeField !== filemapSettings.goldDeposit) {
        if (field.resistance > 1) {
          field.resistance = field.resistance - 1;
          defendingPlayer?.registerFailedEnemyAttack();
        }
        else {
          let tile = this.map.getTileAt(field.x, field.y);
          const eliminated = field.typeField === filemapSettings.townhall && this.townhallDestroyed(field);
          this.currentPlayer.increaseExperience(this.getBuildingDestructionExperience(attackedType, defendingPlayer !== undefined));
          if (eliminated) this.currentPlayer.increaseExperience(gameSettings.eliminatingAPlayer);
          if (field.isGoldDeposit) {
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

  private getBuildingDestructionExperience(type: number, wasEnemyOwned: boolean): number {
    let experience = 0;
    switch (type) {
      case filemapSettings.townhall: experience = gameSettings.destructionOfTheTownHall; break;
      case filemapSettings.barrack: experience = gameSettings.destructionOfTheBarracks; break;
      case filemapSettings.mine: experience = gameSettings.mineDestruction; break;
      case filemapSettings.observationTower: experience = gameSettings.destructionOfTheObservationTower; break;
      case filemapSettings.woodenWall: experience = gameSettings.destructionOfTheWoodenWall; break;
      case filemapSettings.stoneWall: experience = gameSettings.destructionOfTheStoneWall; break;
    }
    return experience * (wasEnemyOwned ? 1 : 0.25);
  }

  calculateAmountOfPlayerGold(): number {
    const fieldsWithGold = this.fields.getPlayerFields(this.currentPlayer.playerId)
      .filter(x => x.typeField === filemapSettings.mine)

    return fieldsWithGold.reduce((gold, mine) => {
      const min = mine.isGoldDeposit
        ? gameSettings.goldGainPerRoundForMineOnDepositMin
        : gameSettings.goldGainPerRoundForMineMin;
      const max = mine.isGoldDeposit
        ? gameSettings.goldGainPerRoundForMineOnDepositMax
        : gameSettings.goldGainPerRoundForMineMax;
      return gold + Phaser.Math.Between(min, max);
    }, gameSettings.goldGainPerRound);
  }



  nextTurn() {
    if (this.gameEnded) return;
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
        this.roundNumber += 1;
      }
      else {
        const nextPlayer = activePlayers[currentPlayerIndex + 1];
        if (nextPlayer) {
          this.currentPlayer = nextPlayer
        }
      }
    }
    else {
      this.showEndGameOverlay(true, "Victory", "All opposing teams have lost their townhalls.");
    }
    this.saveCurrentGame(false);
  }

  buildBarrack(field: Field = this.selectedField.field): boolean {
    if (this.isCurrentPlayerTerritory(field) && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit)) {
      if (this.currentPlayer.actionPoints >= gameSettings.barrackActionPointCost && this.currentPlayer.gold >= gameSettings.barrackGoldCost) {
        const existingBarracks = this.fields.getPlayerFields(this.currentPlayer.playerId)
          .filter(x => x.typeField === filemapSettings.barrack);
        field.typeField = filemapSettings.barrack;
        field.resistance = gameSettings.barrackResistance;
        this.map.putTileAt(filemapSettings.barrack, field.x, field.y, true, 0);
        this.currentPlayer.descreaseGold(gameSettings.barrackGoldCost);
        let troopsAmount = gameSettings.barrackProductivity +
          (existingBarracks.filter(x => x.resistance === gameSettings.barrackResistance).length * gameSettings.barrackProductivityAlreadyOwnedBarracks) +
          (existingBarracks.filter(x => x.resistance < gameSettings.barrackResistance).length * gameSettings.barrackProductivityAlreadyOwnedDamagedBarracks)
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
    let popup = new Popup(this, this.sceneWidth / 2, 54, "panel_beige", text);
    this.time.delayedCall(3000, () => popup.destroy());
  }

  private showPauseMenu() {
    if (this.gameEnded) return;
    if (this.modalOverlay) {
      this.closePauseMenu();
      return;
    }
    this.uiPaused = true;
    this.refreshActionAvailability();
    const overlay = this.add.container(0, 0).setDepth(2000);
    const blocker = this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, 0x020909, 0.78)
      .setInteractive();
    const cardWidth = Math.min(420, this.sceneWidth - 40);
    const card = this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, cardWidth, 400, 0x102728, 1)
      .setStrokeStyle(2, 0xc18b4e, 0.95);
    const title = this.add.text(this.sceneWidth / 2, this.sceneHeight / 2 - 158, "GAME PAUSED", {
      fontFamily: "Arial, sans-serif", fontSize: "27px", color: "#f2d6a2", fontStyle: "bold"
    }).setOrigin(0.5);
    const subtitle = this.add.text(this.sceneWidth / 2, this.sceneHeight / 2 - 124, `Round ${this.roundNumber}  •  ${this.selectedMap.replace(/_/g, " ")}`, {
      fontFamily: "Arial, sans-serif", fontSize: "13px", color: "#88a29f"
    }).setOrigin(0.5);
    const resume = new RoutingButton(this, this.sceneWidth / 2, this.sceneHeight / 2 - 72, "", "RESUME", 1, () => this.closePauseMenu());
    const save = new RoutingButton(this, this.sceneWidth / 2, this.sceneHeight / 2 - 12, "", "SAVE & RESUME", 1, () => {
      const saved = this.saveCurrentGame(false);
      this.closePauseMenu();
      this.createPopup(saved ? "Game saved." : "The browser could not save this game.");
    });
    save.setButtonColor(0x3f755c);
    const restart = new RoutingButton(this, this.sceneWidth / 2, this.sceneHeight / 2 + 48, "", "RESTART MATCH", 1, () => {
      clearGameSnapshot();
      this.scene.restart({ selectedMap: this.selectedMap, numberOfPlayers: this.numberOfPlayers, selectedGameMode: this.selectedGameMode });
    });
    const mainMenu = new RoutingButton(this, this.sceneWidth / 2, this.sceneHeight / 2 + 108, "", "MAIN MENU", 1, () => {
      this.saveCurrentGame(false);
      this.scene.start("WelcomeScene", {});
    });
    mainMenu.setButtonColor(0x733f3a);
    overlay.add([blocker, card, title, subtitle, resume, save, restart, mainMenu]);
    this.modalOverlay = overlay;
  }

  private closePauseMenu() {
    if (!this.modalOverlay || this.gameEnded) return;
    this.modalOverlay.destroy(true);
    this.modalOverlay = undefined;
    this.uiPaused = false;
    this.refreshActionAvailability();
  }

  private showEndGameOverlay(won: boolean, titleText: string, detail: string) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    clearGameSnapshot();
    this.uiPaused = true;
    this.modalOverlay?.destroy(true);
    const overlay = this.add.container(0, 0).setDepth(2500);
    const blocker = this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, won ? 0x10261b : 0x260f0f, 0.86)
      .setInteractive();
    const cardWidth = Math.min(500, this.sceneWidth - 40);
    const card = this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, cardWidth, 310, 0x102728, 1)
      .setStrokeStyle(3, won ? 0xe1b45f : 0xb85d54, 1);
    const title = this.add.text(this.sceneWidth / 2, this.sceneHeight / 2 - 105, titleText.toUpperCase(), {
      fontFamily: "Arial, sans-serif", fontSize: "34px", color: won ? "#f4d78f" : "#e58b80", fontStyle: "bold"
    }).setOrigin(0.5);
    const message = this.add.text(this.sceneWidth / 2, this.sceneHeight / 2 - 55, detail, {
      fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#c6d1cd", align: "center", wordWrap: { width: cardWidth - 50 }
    }).setOrigin(0.5);
    const replay = new RoutingButton(this, this.sceneWidth / 2, this.sceneHeight / 2 + 28, "", "PLAY AGAIN", 1, () => {
      clearGameSnapshot();
      this.scene.restart({ selectedMap: this.selectedMap, numberOfPlayers: this.numberOfPlayers, selectedGameMode: this.selectedGameMode });
    });
    const menu = new RoutingButton(this, this.sceneWidth / 2, this.sceneHeight / 2 + 92, "", "MAIN MENU", 1, () => this.scene.start("WelcomeScene", {}));
    overlay.add([blocker, card, title, message, replay, menu]);
    this.modalOverlay = overlay;
    this.refreshActionAvailability();
  }

  isCurrentPlayerTerritory(field: Field) {
    if (field.player === this.currentPlayer.playerId) {
      return true
    }
    else {
      this.createPopup("You can only perform this action on your territory.");
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

  buildObservationTower(field: Field = this.selectedField.field): boolean {
    if (!this.isCurrentPlayerTerritory(field) || (field.typeField !== filemapSettings.blank && field.typeField !== filemapSettings.goldDeposit)) {
      return false;
    }
    if (this.currentPlayer.actionPoints < gameSettings.observationTowerActionPointCost || this.currentPlayer.gold < gameSettings.observationTowerGoldCost) {
      this.createPopup("Not enough gold or action points to build an observation tower.");
      return false;
    }

    field.typeField = filemapSettings.observationTower;
    field.resistance = gameSettings.observationTowerResistance;
    this.map.putTileAt(filemapSettings.observationTower, field.x, field.y, true, 0);
    this.currentPlayer.descreaseGold(gameSettings.observationTowerGoldCost);
    this.currentPlayer.descreaseActionPoints(gameSettings.observationTowerActionPointCost);
    this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
    this.refreshFogOfWar();
    return true;
  }

  private getMaximumResistance(type: number): number {
    switch (type) {
      case filemapSettings.townhall: return gameSettings.townhallResistance;
      case filemapSettings.mine: return gameSettings.mineResistance;
      case filemapSettings.barrack: return gameSettings.barrackResistance;
      case filemapSettings.observationTower: return gameSettings.observationTowerResistance;
      case filemapSettings.woodenWall: return gameSettings.woodenWallResistance;
      case filemapSettings.stoneWall: return gameSettings.stoneWallResistance;
      default: return 1;
    }
  }

  repairBuilding(field: Field = this.selectedField.field): boolean {
    if (!this.isCurrentPlayerTerritory(field)) return false;
    const maximumResistance = this.getMaximumResistance(field.typeField);
    const missingResistance = maximumResistance - field.resistance;
    if (maximumResistance <= 1 || missingResistance <= 0) {
      this.createPopup("The selected field has no damaged building.");
      return false;
    }
    const goldCost = missingResistance * gameSettings.repairGoldCostPerPoint;
    if (this.currentPlayer.actionPoints < gameSettings.repairActionPointCost || this.currentPlayer.gold < goldCost) {
      this.createPopup(`Repair requires ${goldCost} gold and ${gameSettings.repairActionPointCost} AP.`);
      return false;
    }
    field.resistance = maximumResistance;
    this.currentPlayer.descreaseGold(goldCost);
    this.currentPlayer.descreaseActionPoints(gameSettings.repairActionPointCost);
    this.refreshFogOfWar();
    return true;
  }

  demolishBuilding(field: Field = this.selectedField.field): boolean {
    if (!this.isCurrentPlayerTerritory(field)) return false;
    if (this.getMaximumResistance(field.typeField) <= 1) {
      this.createPopup("There is no building to demolish on this field.");
      return false;
    }
    const townhalls = this.fields.getPlayerFields(this.currentPlayer.playerId)
      .filter(x => x.typeField === filemapSettings.townhall);
    if (field.typeField === filemapSettings.townhall && townhalls.length === 1) {
      this.createPopup("You cannot demolish your last townhall.");
      return false;
    }
    if (this.currentPlayer.actionPoints < gameSettings.demolishActionPointCost) {
      this.createPopup("Not enough action points to demolish this building.");
      return false;
    }
    field.typeField = field.isGoldDeposit ? filemapSettings.goldDeposit : filemapSettings.blank;
    field.resistance = gameSettings.blankFieldResistance;
    this.map.putTileAt(field.typeField, field.x, field.y, true, 0);
    this.currentPlayer.descreaseActionPoints(gameSettings.demolishActionPointCost);
    this.refreshFogOfWar();
    return true;
  }

  transferGold(field: Field = this.selectedField.field): boolean {
    if (this.currentPlayer.gold < 50) {
      this.createPopup("You need at least 50 gold to make a transfer.");
      return false;
    }
    const recipient = field.player === null ? undefined : this.players.find(player => player.playerId === field.player);
    if (!recipient || recipient.playerId === this.currentPlayer.playerId || recipient.team !== this.currentPlayer.team || !recipient.isActive) {
      this.createPopup("Select an active ally's field to transfer gold.");
      return false;
    }
    this.currentPlayer.descreaseGold(50);
    recipient.increaseGold(50);
    this.createPopup(`Transferred 50 gold to ${recipient.name}.`);
    return true;
  }

  buildTownhall(field: Field = this.selectedField.field): boolean {
    if (!this.isCurrentPlayerTerritory(field)) return false;
    if (field.typeField !== filemapSettings.blank && field.typeField !== filemapSettings.goldDeposit) {
      this.createPopup("Townhalls can only be built on an empty sector.");
      return false;
    }
    if (this.currentPlayer.actionPoints < gameSettings.townhallActionPointCost || this.currentPlayer.gold < gameSettings.townhallGoldCost) {
      this.createPopup(`A townhall requires ${gameSettings.townhallGoldCost} gold and ${gameSettings.townhallActionPointCost} AP.`);
      return false;
    }
    field.typeField = filemapSettings.townhall;
    field.resistance = gameSettings.townhallResistance;
    this.map.putTileAt(filemapSettings.townhall, field.x, field.y, true, 0);
    this.currentPlayer.descreaseGold(gameSettings.townhallGoldCost);
    this.currentPlayer.descreaseActionPoints(gameSettings.townhallActionPointCost);
    this.currentPlayer.increaseExperience(gameSettings.constructionOfTheBuilding);
    return true;
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
    this.rightPanel.updateAffordability(this.currentPlayer.gold, this.currentPlayer.actionPoints, this.currentPlayer.troops);
    this.refreshActionAvailability();
  }


  handleBotMove() {
    this.rightPanel.showPlayerActionsAndBuilding(false);
    const ownFields = this.fields.getPlayerFields(this.currentPlayer.playerId);
    const buildableFields = ownFields.filter(field =>
      field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit
    );
    const freeGoldDeposits = buildableFields.filter(field => field.typeField === filemapSettings.goldDeposit);
    const mines = ownFields.filter(field => field.typeField === filemapSettings.mine);
    const barracks = ownFields.filter(field => field.typeField === filemapSettings.barrack);
    const townhalls = ownFields.filter(field => field.typeField === filemapSettings.townhall);
    const towers = ownFields.filter(field => field.typeField === filemapSettings.observationTower);
    const damagedBuildings = ownFields
      .filter(field => this.getMaximumResistance(field.typeField) > field.resistance)
      .sort((a, b) => {
        const aPriority = a.typeField === filemapSettings.townhall ? 1 : 0;
        const bPriority = b.typeField === filemapSettings.townhall ? 1 : 0;
        return (bPriority - aPriority) || (a.resistance - b.resistance);
      });
    const safestBuildField = chooseSafestBuildField(buildableFields, field => this.countBotFrontierNeighbors(field));
    const frontierBuildField = chooseFrontierBuildField(buildableFields, field => this.countBotFrontierNeighbors(field));

    const perform = (action: () => void | boolean): boolean => {
      const before = `${this.currentPlayer.actionPoints}:${this.currentPlayer.gold}:${this.currentPlayer.troops}`;
      action();
      return before !== `${this.currentPlayer.actionPoints}:${this.currentPlayer.gold}:${this.currentPlayer.troops}`;
    };
    const canAfford = (gold: number, actionPoints: number): boolean =>
      this.currentPlayer.gold >= gold && this.currentPlayer.actionPoints >= actionPoints;
    const canRepair = (field: Field): boolean => {
      const missingResistance = this.getMaximumResistance(field.typeField) - field.resistance;
      return missingResistance > 0 && canAfford(
        missingResistance * gameSettings.repairGoldCostPerPoint,
        gameSettings.repairActionPointCost
      );
    };

    const criticalTownhall = damagedBuildings.find(field =>
      field.typeField === filemapSettings.townhall && field.resistance <= 1
    );
    if (criticalTownhall && canRepair(criticalTownhall) && perform(() => this.repairBuilding(criticalTownhall))) return;

    if (freeGoldDeposits[0] && canAfford(gameSettings.mineGoldCost, gameSettings.mineActionPointCost) &&
      perform(() => this.buildMine(freeGoldDeposits[0]))) return;

    if (this.currentPlayer.troops <= 3 && safestBuildField &&
      canAfford(gameSettings.barrackGoldCost, gameSettings.barrackActionPointCost) &&
      perform(() => this.buildBarrack(safestBuildField))) return;

    if (mines.length === 0 && ownFields.length >= 3 && safestBuildField &&
      canAfford(gameSettings.mineGoldCost, gameSettings.mineActionPointCost) &&
      perform(() => this.buildMine(safestBuildField))) return;

    if (this.tryBotAttack()) return;

    const desiredBarracks = Math.max(1, Math.floor(ownFields.length / 12));
    if (this.currentPlayer.troops < 20 && barracks.length < desiredBarracks && safestBuildField &&
      canAfford(gameSettings.barrackGoldCost, gameSettings.barrackActionPointCost) &&
      perform(() => this.buildBarrack(safestBuildField))) return;

    if (towers.length === 0 && ownFields.length >= 6 && frontierBuildField &&
      canAfford(gameSettings.observationTowerGoldCost, gameSettings.observationTowerActionPointCost) &&
      perform(() => this.buildObservationTower(frontierBuildField))) return;

    if (townhalls.length > 0 && ownFields.length >= townhalls.length * 12 &&
      this.currentPlayer.gold >= gameSettings.townhallGoldCost + 200 &&
      this.currentPlayer.actionPoints >= gameSettings.townhallActionPointCost && safestBuildField &&
      perform(() => this.buildTownhall(safestBuildField))) return;

    const repairableBuilding = damagedBuildings.find(canRepair);
    if (repairableBuilding && perform(() => this.repairBuilding(repairableBuilding))) return;

    const exposedFrontier = buildableFields
      .filter(field => this.countBotFrontierNeighbors(field) >= 2)
      .sort((a, b) => this.countBotFrontierNeighbors(b) - this.countBotFrontierNeighbors(a))[0];
    if (exposedFrontier && this.currentPlayer.gold >= 600) {
      if (this.currentPlayer.gold >= gameSettings.stoneWallGoldCost &&
        this.currentPlayer.actionPoints >= gameSettings.stoneWallActionPointCost &&
        perform(() => this.buildStoneWall(exposedFrontier))) return;
      if (this.currentPlayer.actionPoints >= gameSettings.woodenWallActionPointCost &&
        perform(() => this.buildWoodenWall(exposedFrontier))) return;
    }

    this.nextTurn();
  }

  nextMove() {
    if (this.uiPaused || this.gameEnded) return;
    this.updateHumanInfo();
    if (this.currentPlayer.actionPoints > 0) {
      if (this.currentPlayer.isHuman) {
        this.handleHumanMove();
      } else {
        this.handleBotMove();
      }
    } else {
      if (!this.currentPlayer.isHuman) this.nextTurn();
    }

    this.leftPanel?.updatePlayerList(this.players, this.currentPlayer.playerId);
    this.rightPanel.updateCurrentPlayer(this.currentPlayer.name, this.currentPlayer.team, this.currentPlayer.isHuman, this.roundNumber);
    this.refreshActionAvailability();
  }

  updateSelectedField(x, y) {
    this.selectedField?.clearGraphics();
    const field = this.fields.get(y, x);
    const alliedIds = this.players.filter(player => player.team === this.currentPlayer.team).map(player => player.playerId);
    const isFriendly = field.player !== null && alliedIds.includes(field.player);
    const outlineColor = field.player === this.currentPlayer.playerId
      ? 0x73d29b
      : field.blocked
        ? 0x768685
        : this.currentPlayer.isHuman && !isFriendly && this.canCurrentPlayerAttack(field)
          ? 0xf0a34b
          : 0xd95f55;
    const g = this.createTileOutline(x, y, outlineColor);
    this.selectedField = new SelectedField(field, g)
    this.updateSelectedFieldInfo();
  }

  private updateSelectedFieldInfo() {
    if (!this.selectedField || !this.rightPanel) return;
    const field = this.selectedField.field;
    const names: Record<number, string> = {
      [filemapSettings.blank]: "Empty",
      [filemapSettings.goldDeposit]: "Gold deposit",
      [filemapSettings.townhall]: "Townhall",
      [filemapSettings.stone]: "Stone",
      [filemapSettings.barrack]: "Barrack",
      [filemapSettings.tree]: "Tree",
      [filemapSettings.mine]: "Mine",
      [filemapSettings.observationTower]: "Observation tower",
      [filemapSettings.woodenWall]: "Wooden wall",
      [filemapSettings.stoneWall]: "Stone wall"
    };
    const owner = field.player === null ? "Neutral" : this.players.find(p => p.playerId === field.player)?.name ?? "Unknown";
    const alliedIds = this.players.filter(player => player.team === this.currentPlayer.team).map(player => player.playerId);
    const attackable = this.currentPlayer.isHuman && !field.blocked && (field.player === null || !alliedIds.includes(field.player)) && this.canCurrentPlayerAttack(field);
    this.rightPanel.updateTileInfo(`${names[field.typeField] ?? "Field"}  •  ${owner}  •  ${field.resistance} HP${attackable ? "  •  ATTACKABLE" : ""}`);
    this.refreshActionAvailability();
  }

  private refreshActionAvailability() {
    if (!this.rightPanel || !this.selectedField || !this.currentPlayer) return;
    const field = this.selectedField.field;
    const ownField = field.player === this.currentPlayer.playerId;
    const alliedPlayer = field.player === null ? undefined : this.players.find(player => player.playerId === field.player);
    const friendly = alliedPlayer?.team === this.currentPlayer.team;
    const townhalls = this.fields.getPlayerFields(this.currentPlayer.playerId).filter(item => item.typeField === filemapSettings.townhall);
    const isBuilding = this.getMaximumResistance(field.typeField) > 1;
    const maximumResistance = this.getMaximumResistance(field.typeField);
    this.rightPanel.updateContextAvailability({
      attack: !field.blocked && !friendly && this.canCurrentPlayerAttack(field),
      leave: ownField && (field.typeField !== filemapSettings.townhall || townhalls.length > 1),
      build: ownField && (field.typeField === filemapSettings.blank || field.typeField === filemapSettings.goldDeposit),
      repair: ownField && isBuilding && field.resistance < maximumResistance,
      demolish: ownField && isBuilding && (field.typeField !== filemapSettings.townhall || townhalls.length > 1),
      transfer: !!alliedPlayer && alliedPlayer.playerId !== this.currentPlayer.playerId && alliedPlayer.team === this.currentPlayer.team && alliedPlayer.isActive,
      humanTurn: this.currentPlayer.isHuman && !this.uiPaused && !this.gameEnded
    });
  }

  private setupInput() {
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.uiPaused || this.gameEnded) return;
      if (this.sceneWidth < 960 && this.leftPanel?.visible && pointer.worldX <= this.leftPanelX + this.leftPanelWidth) return;
      if (this.sceneWidth < 960 && this.rightPanel?.visible && pointer.worldX >= this.rightPanelX) return;
      if (pointer.worldX <= this.mapLayerX || pointer.worldX >= this.mapLayerRight || pointer.worldY <= this.tilemapY || pointer.worldY >= this.tilemapY + (filemapSettings.tileHeight * gameSettings.mapSizeY * this.newScale)) return;
      const tile = this.map.getTileAtWorldXY(pointer.worldX, pointer.worldY);
      if (!tile) return;
      this.updateSelectedField(tile.x, tile.y);
      if (pointer.rightButtonDown() && this.currentPlayer.isHuman) {
        this.humanAttack(this.selectedField.field);
      }
    });

    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    const humanAction = (action: () => void) => {
      if (this.currentPlayer.isHuman && this.selectedField && !this.uiPaused && !this.gameEnded) action();
    };
    keyboard.on('keydown-ESC', () => this.showPauseMenu());
    keyboard.on('keydown-A', () => humanAction(() => this.humanAttack(this.selectedField.field)));
    keyboard.on('keydown-L', () => humanAction(() => this.leaveField(this.selectedField.field)));
    keyboard.on('keydown-F', () => humanAction(() => this.nextTurn()));
    keyboard.on('keydown-SPACE', () => humanAction(() => this.nextTurn()));
    keyboard.on('keydown-T', () => humanAction(() => this.buildTownhall()));
    keyboard.on('keydown-B', () => humanAction(() => this.buildBarrack()));
    keyboard.on('keydown-M', () => humanAction(() => this.buildMine()));
    keyboard.on('keydown-O', () => humanAction(() => this.buildObservationTower()));
    keyboard.on('keydown-W', () => humanAction(() => this.buildWoodenWall()));
    keyboard.on('keydown-S', () => humanAction(() => this.buildStoneWall()));
    keyboard.on('keydown-R', () => humanAction(() => this.repairBuilding()));
    keyboard.on('keydown-D', () => humanAction(() => this.demolishBuilding()));
    keyboard.on('keydown-G', () => humanAction(() => this.transferGold()));

    keyboard.on('keydown-UP', () => humanAction(() => {
      if (this.selectedField.field.y > 0) this.updateSelectedField(this.selectedField.field.x, this.selectedField.field.y - 1);
    }));
    keyboard.on('keydown-DOWN', () => humanAction(() => {
      if (this.selectedField.field.y < gameSettings.mapSizeY - 1) this.updateSelectedField(this.selectedField.field.x, this.selectedField.field.y + 1);
    }));
    keyboard.on('keydown-LEFT', () => humanAction(() => {
      if (this.selectedField.field.x > 0) this.updateSelectedField(this.selectedField.field.x - 1, this.selectedField.field.y);
    }));
    keyboard.on('keydown-RIGHT', () => humanAction(() => {
      if (this.selectedField.field.x < gameSettings.mapSizeX - 1) this.updateSelectedField(this.selectedField.field.x + 1, this.selectedField.field.y);
    }));
  }

  update(_time: number): void {
    this.borders?.destroy();
    this.borders = undefined;
    this.drawBorders();

    if (!this.uiPaused && !this.gameEnded && this.timeSinceLastIncrement + 350 < this.game.getTime()) {
      this.timeSinceLastIncrement = this.game.getTime();
      this.nextMove();
      this.updateSelectedFieldInfo();
    }
  }

};
