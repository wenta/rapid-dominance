import Dropdown, { DropdownOption } from './components/dropdown';
import { RoutingButton } from './components/routingButton';
import GameMode, { deathmatch, t2p2, t2p3, t2p4, t2p5, t2p6, t2p7, t2p8, t3p2, t3p3, t4p2, t4p4, t5p2, t6p2, t7p2, t8p2 } from './gameMode';
import { clearGameSnapshot, readGameSnapshot } from './gameSave';
import * as filemapSettings from './settings/filemapSettings';
import { backgroundWidth, buttonHeight } from './settings/textureSettings';

interface GameMaps {
  mapName: string;
  id: string;
  maxPlayers: number;
}

export class WelcomeScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  previewTitle: Phaser.GameObjects.Text;
  sceneWidth: number = 0;
  sceneHeight: number = 0;
  numberOfPlayers: number = 4;
  selectedMap: string = "eagles_nest";
  selectedGameMode: GameMode = deathmatch;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  previewLayer: Phaser.Tilemaps.TilemapLayer;

  gameModesDropdown: Dropdown;
  selectedMapDropdown: Dropdown;
  aboutButton: RoutingButton;
  instructionButton: RoutingButton;
  startButton: RoutingButton;
  continueButton: RoutingButton | undefined;
  numberOfPlayersDropdown: Dropdown;
  selectedModeLabel: Dropdown;
  compactLayout: boolean = false;

  gameMaps: GameMaps[] = [
    { mapName: 'One vs one', id: 'one_vs_one', maxPlayers: 2 },
    { mapName: 'Eagles Nest', id: 'eagles_nest', maxPlayers: 4 },
    { mapName: 'Eight', id: 'eight', maxPlayers: 8 },
    { mapName: 'Flower', id: 'flower', maxPlayers: 8 },
    { mapName: 'Middle wall', id: 'middle_wall', maxPlayers: 12 },
    { mapName: 'Hex', id: 'hex', maxPlayers: 16 },
    { mapName: 'Stone', id: 'stones', maxPlayers: 16 }
  ];

  gameModes: GameMode[] = [deathmatch, t2p2, t2p3, t3p2, t2p4, t4p2, t3p3, t2p5, t5p2, t2p6, t6p2, t2p7, t7p2, t2p8, t8p2, t4p4];

  constructor() {
    super({
      key: "WelcomeScene"
    });
  }

  preload(): void {
    this.load.setBaseURL(".");
    this.load.image("menu_item", "assets/buttonLong_brown.png");
    this.load.image("background", "assets/backgroundColorDesert.png");
    this.load.image("eft_filemap", "assets/eft_filemap-v2.png");
    this.gameMaps.forEach(x => this.load.tilemapCSV(x.id, 'assets/' + x.id + '.csv'));
  }

  createFooter() {
    const footerY = this.sceneHeight - Math.max(38, buttonHeight * 0.8);
    const footerScale = Phaser.Math.Clamp((this.sceneWidth - 32) / 464, 0.55, 1);
    const footerOffset = (110 * footerScale) + 8;
    this.aboutButton = new RoutingButton(
      this,
      -footerOffset,
      0,
      "menu_item",
      "About",
      footerScale,
      () => this.scene.start("AboutScene", {})
    );

    this.instructionButton = new RoutingButton(
      this,
      footerOffset,
      0,
      "menu_item",
      "Instruction",
      footerScale,
      () => this.scene.start("InstructionScene", {})
    );

    this.add.container(this.sceneWidth / 2, footerY, [this.aboutButton, this.instructionButton])
      .setDepth(100);
  }

  create(): void {
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;
    this.compactLayout = this.sceneWidth < 900;
    const savedGame = readGameSnapshot();

    this.add.sprite(0, 0, 'background')
      .setOrigin(0)
      .setScale(Math.max(this.sceneWidth / backgroundWidth, this.sceneHeight / 600))
      .setTint(0x557b78)
      .setAlpha(0.34);
    this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, 0x07191a, 0.72).setDepth(1);

    // Centered Title with shadow
    this.title = this.add.text(this.sceneWidth / 2, Math.max(45, this.sceneHeight * 0.09), "Rapid Dominance", {
      fontFamily: 'Arial',
      fontSize: `${Math.max(26, Math.min(44, this.sceneWidth * 0.055))}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#4a3319',
      strokeThickness: 6,
      shadow: {
        offsetX: 2,
        offsetY: 3,
        color: '#000000',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5).setDepth(10);

    const menuX = this.compactLayout ? this.sceneWidth / 2 : this.sceneWidth * 0.35;
    const startY = Math.max(120, this.sceneHeight * 0.23);
    const rowGap = Math.min(65, (this.sceneHeight * 0.55) / 4);
    const menuCardHeight = Math.min(this.sceneHeight - 165, rowGap * (savedGame ? 5.35 : 4.5));
    this.add.rectangle(menuX, startY + menuCardHeight / 2 - 36, this.compactLayout ? Math.min(340, this.sceneWidth - 20) : 340, menuCardHeight, 0x102728, 0.94)
      .setStrokeStyle(1, 0x42605e, 0.95).setDepth(2);
    if (!this.compactLayout) {
      const previewCardTop = startY - 48;
      const previewCardBottom = this.sceneHeight - 88;
      this.add.rectangle(this.sceneWidth * 0.76, (previewCardTop + previewCardBottom) / 2, this.sceneWidth * 0.41, previewCardBottom - previewCardTop, 0x102728, 0.94)
        .setStrokeStyle(1, 0x42605e, 0.95).setDepth(2);
    }

    // 1. Game Mode Dropdown
    const gameModesDropdownOptions: DropdownOption[] = this.getGameModesDropdownOptions();
    this.gameModesDropdown = new Dropdown(
      this,
      menuX,
      startY,
      "menu_item",
      "Mode: " + this.selectedGameMode.name,
      gameModesDropdownOptions,
      (selectedOption: string) => {
        this.changeGameMode(selectedOption);
      }
    );

    // 2. Number of Players Dropdown
    const numberOfPlayersDropdownOptions: DropdownOption[] = [];
    for (let i = 2; i <= 16; i++) {
      numberOfPlayersDropdownOptions.push({
        text: `${i} players`,
        value: i.toString(),
        image: "menu_item"
      });
    }

    this.numberOfPlayersDropdown = new Dropdown(
      this,
      menuX,
      startY + rowGap,
      "menu_item",
      `Players: ${this.numberOfPlayers} players`,
      numberOfPlayersDropdownOptions,
      (selectedOption: string) => {
        this.numberOfPlayers = parseInt(selectedOption);
        this.numberOfPlayersDropdown.setLabelText(`Players: ${this.numberOfPlayers} players`);
        this.generateMapOptions();
        this.updateStartButtonState();
      }
    );

    // Label for non-deathmatch fixed players
    this.selectedModeLabel = new Dropdown(
      this,
      menuX,
      startY + rowGap,
      "menu_item",
      this.selectedGameMode.name,
      [],
      () => { }
    );
    this.selectedModeLabel.setVisible(false);

    // 3. Map Dropdown
    this.selectedMapDropdown = new Dropdown(
      this,
      menuX,
      startY + (2 * rowGap),
      "menu_item",
      "Map: Eagles Nest",
      [],
      (selectedOption: string) => {
        this.selectedMap = selectedOption;
        const found = this.gameMaps.find(m => m.id === selectedOption);
        if (found) {
          this.selectedMapDropdown.setLabelText(`Map: ${found.mapName}`);
        }
        this.changeMap();
        this.updateStartButtonState();
      }
    );

    // 4. Start Button
    this.startButton = new RoutingButton(
      this,
      menuX,
      startY + (3.3 * rowGap),
      "menu_item",
      ">> START GAME <<",
      1,
      () => {
        if (this.numberOfPlayers !== 0 && this.selectedMap !== "") {
          clearGameSnapshot();
          this.scene.start("GameScene", {
            selectedMap: this.selectedMap,
            numberOfPlayers: this.numberOfPlayers,
            selectedGameMode: this.selectedGameMode
          });
        }
      }
    );
    this.startButton.setDepth(100);

    if (savedGame) {
      this.continueButton = new RoutingButton(
        this,
        menuX,
        startY + (4.15 * rowGap),
        "menu_item",
        `CONTINUE  •  ROUND ${savedGame.roundNumber}`,
        1,
        () => this.scene.start("GameScene", { snapshot: savedGame })
      );
      this.continueButton.setButtonColor(0x3f755c);
      this.continueButton.setDepth(100);
    }

    // Map preview title on right
    this.previewTitle = this.add.text(this.sceneWidth * 0.72, startY - 20, "Map Preview", {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#f2d6a2',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10).setVisible(!this.compactLayout);

    this.createFooter();
    this.generateMapOptions();
    this.changeMap();
    this.updateStartButtonState();
  }

  updateStartButtonState() {
    const isReady = this.numberOfPlayers > 0 && this.selectedMap !== "";
    if (this.startButton) {
      this.startButton.setEnabled(isReady);
    }
  }

  changeMap() {
    if (this.previewLayer) {
      this.previewLayer.destroy();
    }

    this.map = this.make.tilemap({
      key: this.selectedMap,
      tileWidth: filemapSettings.tileWidth,
      tileHeight: filemapSettings.tileHeight
    });

    this.tileset = this.map.addTilesetImage('eft_filemap', undefined, filemapSettings.tileWidth, filemapSettings.tileHeight, -2, -2);

    if (this.tileset && !this.compactLayout) {
      const previewAreaLeft = this.sceneWidth * 0.56;
      const previewAreaRight = this.sceneWidth * 0.96;
      const previewY = Math.max(120, this.sceneHeight * 0.26);
      const previewBottom = this.sceneHeight - Math.max(90, buttonHeight * 1.8);
      const availableWidth = Math.max(120, previewAreaRight - previewAreaLeft);
      const availableHeight = Math.max(120, previewBottom - previewY);
      const previewScale = Math.min(
        availableWidth / this.map.widthInPixels,
        availableHeight / this.map.heightInPixels,
        0.28
      );
      const previewX = previewAreaLeft + ((availableWidth - this.map.widthInPixels * previewScale) / 2);
      this.previewLayer = this.map.createLayer(0, this.tileset, previewX, previewY);
      if (this.previewLayer) {
        this.previewLayer.setScale(previewScale);
        this.previewLayer.setAlpha(0.95);
        this.previewLayer.setDepth(5);
      }
    }

    const currentMap = this.gameMaps.find(m => m.id === this.selectedMap);
    if (this.previewTitle && currentMap) {
      this.previewTitle.setText(`Map: ${currentMap.mapName} (Max: ${currentMap.maxPlayers}p)`);
    }
  }

  getGameModesDropdownOptions(): DropdownOption[] {
    return this.gameModes.map(gm => ({
      text: gm.name,
      value: gm.name,
      image: "menu_item"
    }));
  }

  changeGameMode(option: string): void {
    const gm = this.gameModes.find(x => x.name === option);
    if (gm) {
      this.selectedGameMode = gm;
      this.gameModesDropdown.setLabelText("Mode: " + gm.name);

      if (gm === deathmatch) {
        this.selectedModeLabel.setVisible(false);
        this.numberOfPlayersDropdown.setVisible(true);
      } else {
        this.selectedModeLabel.setVisible(true);
        this.selectedModeLabel.setLabelText(this.selectedGameMode.name);
        this.numberOfPlayersDropdown.setVisible(false);
      }
      this.numberOfPlayers = this.selectedGameMode.getMaxNumberOfPlayers();
      this.generateMapOptions();
      this.updateStartButtonState();
    }
  }

  generateMapOptions(): void {
    const opts = this.gameMaps
      .filter(map => map.maxPlayers >= this.numberOfPlayers)
      .map(map => ({
        text: `${map.mapName} (≤${map.maxPlayers}p)`,
        value: map.id,
        image: "menu_item"
      }));

    this.selectedMapDropdown.updateOptions(this, opts, (selectedOption: string) => {
      this.selectedMap = selectedOption;
      const found = this.gameMaps.find(m => m.id === selectedOption);
      if (found) {
        this.selectedMapDropdown.setLabelText(`Map: ${found.mapName}`);
      }
      this.changeMap();
      this.updateStartButtonState();
    });

    // If current selected map doesn't fit current player count, switch to first compatible map
    const isCurrentMapValid = opts.some(o => o.value === this.selectedMap);
    if (!isCurrentMapValid && opts.length > 0) {
      this.selectedMap = opts[0].value;
      this.selectedMapDropdown.setLabelText(`Map: ${opts[0].text}`);
      this.changeMap();
    } else {
      const found = this.gameMaps.find(m => m.id === this.selectedMap);
      if (found) {
        this.selectedMapDropdown.setLabelText(`Map: ${found.mapName}`);
      }
    }
  }

  update(time: number, delta: number): void {
  }
}
