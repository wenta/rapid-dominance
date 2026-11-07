import Dropdown, { DropdownOption } from './components/dropdown';
import { RoutingButton } from './components/routingButton';
import GameMode, { deathmatch, t2p2, t2p3, t2p4, t2p5, t2p6, t2p7, t2p8, t3p2, t3p3, t4p2, t4p4, t5p2, t6p2, t7p2, t8p2 } from './gameMode';
import { clearGameSnapshot, readGameSnapshot } from './gameSave';
import { buttonHeight } from './settings/textureSettings';
import { uiTheme } from './uiTheme';

interface GameMaps {
  mapName: string;
  id: string;
  maxPlayers: number;
}

export class WelcomeScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  sceneWidth: number = 0;
  sceneHeight: number = 0;
  numberOfPlayers: number = 4;
  selectedMap: string = "eagles_nest";
  selectedGameMode: GameMode = deathmatch;
  devMode: boolean = false;

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
    this.load.image("menu_background", "assets/menu-background-v3.webp");
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
      "ABOUT",
      footerScale,
      () => this.scene.start("AboutScene", {})
    );

    this.instructionButton = new RoutingButton(
      this,
      footerOffset,
      0,
      "menu_item",
      "HOW TO PLAY",
      footerScale,
      () => this.scene.start("InstructionScene", {})
    );

    this.add.container(this.sceneWidth / 2, footerY, [this.aboutButton, this.instructionButton])
      .setDepth(100);
  }

  createDevToggle() {
    const footerY = this.sceneHeight - Math.max(38, buttonHeight * 0.8);
    const container = this.add.container(this.sceneWidth / 2, footerY - 52).setDepth(120);
    const shadow = this.add.rectangle(3, 4, 244, 36, 0x2e2419, 0.28);
    const panel = this.add.rectangle(0, 0, 244, 36, uiTheme.stoneLight, 0.96)
      .setStrokeStyle(2, uiTheme.border, 0.95);
    const label = this.add.text(-105, 0, "DEV MODE", {
      fontFamily: uiTheme.sans, fontSize: "10px", color: "#645136", fontStyle: "bold", letterSpacing: 2
    }).setOrigin(0, 0.5);
    const track = this.add.rectangle(-4, 0, 38, 20, uiTheme.stoneDark, 1).setStrokeStyle(1, uiTheme.border, 1);
    const knob = this.add.circle(-13, 0, 7, uiTheme.stoneLight, 1);
    const state = this.add.text(23, 0, "OFF", {
      fontFamily: uiTheme.sans, fontSize: "9px", color: "#645136", fontStyle: "bold"
    }).setOrigin(0, 0.5);
    const detail = this.add.text(79, 0, "10K GOLD · 100 AP", {
      fontFamily: uiTheme.sans, fontSize: "9px", color: "#645136", fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0.62);
    const hitArea = this.add.rectangle(0, 0, 244, 40, 0xffffff, 0.001).setInteractive({ useHandCursor: true });

    const update = () => {
      track.setFillStyle(this.devMode ? uiTheme.gold : uiTheme.stoneDark, 1);
      track.setStrokeStyle(1, this.devMode ? uiTheme.goldLight : uiTheme.border, 1);
      knob.setX(this.devMode ? 5 : -13).setFillStyle(this.devMode ? 0xffe3a9 : uiTheme.stoneLight, 1);
      label.setColor(this.devMode ? "#8d5418" : "#645136");
      state.setText(this.devMode ? "ON" : "OFF").setColor(this.devMode ? "#8d5418" : "#645136");
      detail.setAlpha(this.devMode ? 1 : 0.62);
    };
    hitArea.on("pointerdown", () => {
      this.devMode = !this.devMode;
      update();
    });
    container.add([shadow, panel, hitArea, label, track, knob, state, detail]);
    update();
  }

  create(): void {
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;
    this.compactLayout = this.sceneWidth < 900;
    const savedGame = readGameSnapshot();

    const background = this.add.image(this.sceneWidth / 2, this.sceneHeight / 2, 'menu_background').setDepth(0);
    const coverScale = Math.max(this.sceneWidth / background.width, this.sceneHeight / background.height);
    background.setScale(coverScale);
    this.tweens.add({
      targets: background,
      scaleX: background.scaleX * 1.035,
      scaleY: background.scaleY * 1.035,
      duration: 18000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight, 0x5c492e, 0.08).setDepth(1);
    this.add.rectangle(this.sceneWidth / 2, this.sceneHeight / 2, Math.min(700, this.sceneWidth * 0.82), this.sceneHeight, 0xfff2c9, 0.05).setDepth(1);

    const menuX = this.sceneWidth / 2;
    const titleY = Math.max(52, this.sceneHeight * 0.09);
    this.add.text(menuX, titleY - 30, "TURN-BASED TERRITORY STRATEGY", {
      fontFamily: uiTheme.sans, fontSize: '11px', color: '#ffe1a1', fontStyle: 'bold', letterSpacing: 3
    }).setOrigin(0.5).setDepth(10);
    this.title = this.add.text(menuX, titleY, "RAPID DOMINANCE", {
      fontFamily: uiTheme.serif,
      fontSize: `${Math.max(28, Math.min(48, this.sceneWidth * 0.045))}px`,
      color: '#f5ecd9',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 8, fill: true }
    }).setOrigin(0.5).setDepth(10);
    this.add.text(menuX, titleY + 39, "Build your realm. Break their defenses. Rule the map.", {
      fontFamily: uiTheme.serif, fontSize: '13px', color: '#f5e4bd'
    }).setOrigin(0.5).setDepth(10);

    const startY = Math.max(170, this.sceneHeight * 0.27);
    const availableMenuHeight = this.sceneHeight - startY - 80;
    const rowGap = Phaser.Math.Clamp(availableMenuHeight / (savedGame ? 4.7 : 3.9), 44, 65);
    const menuCardHeight = Math.min(this.sceneHeight - 165, rowGap * (savedGame ? 5.35 : 4.5));
    const menuCardWidth = this.compactLayout ? Math.min(350, this.sceneWidth - 24) : 410;
    this.add.rectangle(menuX + 6, startY + menuCardHeight / 2 - 30, menuCardWidth, menuCardHeight, 0x2e2419, 0.3).setDepth(2);
    this.add.rectangle(menuX, startY + menuCardHeight / 2 - 36, menuCardWidth, menuCardHeight, uiTheme.stone, 0.98)
      .setStrokeStyle(4, uiTheme.border, 1).setDepth(3);
    this.add.rectangle(menuX, startY + menuCardHeight / 2 - 36, menuCardWidth - 12, menuCardHeight - 12, 0xffffff, 0)
      .setStrokeStyle(1, uiTheme.stoneLight, 0.95).setDepth(4);
    this.add.rectangle(menuX, startY - 66, 178, 28, uiTheme.stoneLight, 1)
      .setStrokeStyle(2, uiTheme.border, 1).setDepth(8);
    this.add.text(menuX, startY - 68, "MATCH SETUP", {
      fontFamily: uiTheme.serif, fontSize: '12px', color: uiTheme.ink, fontStyle: 'bold', letterSpacing: 1
    }).setOrigin(0.5).setDepth(10);

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
        this.updateStartButtonState();
      }
    );

    // 4. Start Button
    this.startButton = new RoutingButton(
      this,
      menuX,
      startY + (3.3 * rowGap),
      "menu_item",
      "START MATCH",
      1,
      () => {
        if (this.numberOfPlayers !== 0 && this.selectedMap !== "") {
          clearGameSnapshot();
          this.scene.start("GameScene", {
            selectedMap: this.selectedMap,
            numberOfPlayers: this.numberOfPlayers,
            selectedGameMode: this.selectedGameMode,
            devMode: this.devMode
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
        `CONTINUE MATCH  •  ROUND ${savedGame.roundNumber}`,
        1,
        () => this.scene.start("GameScene", { snapshot: savedGame })
      );
      this.continueButton.setButtonColor(0x3f755c);
      this.continueButton.setDepth(100);
    }

    this.createFooter();
    this.createDevToggle();
    this.generateMapOptions();
    this.updateStartButtonState();
  }

  updateStartButtonState() {
    const isReady = this.numberOfPlayers > 0 && this.selectedMap !== "";
    if (this.startButton) {
      this.startButton.setEnabled(isReady);
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
      this.updateStartButtonState();
    });

    // If current selected map doesn't fit current player count, switch to first compatible map
    const isCurrentMapValid = opts.some(o => o.value === this.selectedMap);
    if (!isCurrentMapValid && opts.length > 0) {
      this.selectedMap = opts[0].value;
      this.selectedMapDropdown.setLabelText(`Map: ${opts[0].text}`);
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
