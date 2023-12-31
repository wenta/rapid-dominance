import Dropdown, { DropdownOption } from './components/dropdown';
import { RoutingButton } from './components/routingButton';
import GameMode, { deathmatch, t2p2, t3p2, t3p3, t4p2, t4p4, t5p2, t6p2, t7p2, t8p2 } from './gameMode';
import * as filemapSettings from './settings/filemapSettings';
import * as menuItemSettings from './settings/textureSettings';
import { backgroundWidth, buttonHeight } from './settings/textureSettings';
interface GameMaps {
  mapName: string,
  id: string,
  maxPlayers: number
}

export class WelcomeScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  hint: Phaser.GameObjects.Text;
  sceneWidth: number = 0
  sceneHeight: number = 0
  numberOfPlayers: number = 0
  selectedMap: string = "hex"
  selectedGameMode: GameMode = deathmatch
  map: Phaser.Tilemaps.Tilemap
  tileset: Phaser.Tilemaps.Tileset
  selectedMapDropdown: Dropdown
  aboutButton: RoutingButton
  instructionButton: RoutingButton
  startButton: RoutingButton
  numberOfPlayersDropdown: Phaser.GameObjects.Container
  selectedModeLabel: Phaser.GameObjects.Container

  gameMaps: GameMaps[] = [
    { mapName: 'One vs one', id: 'one_vs_one', maxPlayers: 2 },
    { mapName: 'Eagles Nest', id: 'eagles_nest', maxPlayers: 4 },
    { mapName: 'Eight', id: 'eight', maxPlayers: 8 },
    { mapName: 'Flower', id: 'flower', maxPlayers: 8 },
    { mapName: 'Middle wall', id: 'middle_wall', maxPlayers: (this.cameras.main.width * 0.015, this.cameras.main.height * 0.02) },
    { mapName: 'Hex', id: 'hex', maxPlayers: (this.cameras.main.width * 0.02, this.cameras.main.height * 0.02666666666666667) },
    { mapName: 'Stone', id: 'stones', maxPlayers: (this.cameras.main.width * 0.02, this.cameras.main.height * 0.02666666666666667) }];

  gameModes: GameMode[] = [deathmatch, t2p2, t3p2, t4p2, t5p2, t6p2, t7p2, t8p2, t3p3, t4p4]


  constructor() {
    super({
      key: "WelcomeScene"
    });
  }

  preload(): void {
    this.load.setBaseURL(".");
    this.load.image("menu_item", "assets/buttonLong_brown.png");
    this.load.image("background", "assets/backgroundColorDesert.png");
    this.load.image("eft_filemap", "assets/eft_filemap.png");
    this.gameMaps.forEach(x => this.load.tilemapCSV(x.id, 'assets/' + x.id + '.csv'))

  }

  createFooter() {
    let footerY = this.sceneHeight - (2 * buttonHeight)
    this.aboutButton = new RoutingButton(this, - (menuItemSettings.buttonWidth / 2), 0, "menu_item", "About", 1,
      () => this.scene.start("AboutScene", {}));


    this.instructionButton = new RoutingButton(this,  (menuItemSettings.buttonWidth / 2), 0, "menu_item", "Instruction", 1,
      () => this.scene.start("InstructionScene", {}));


    this.add.container(0, footerY, [this.aboutButton, this.instructionButton])
      .setScale(0.7)
      .setX((this.sceneWidth / 2));
  }

  create(): void {
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;

    this.add.sprite(0, 0, 'background').setOrigin(0).setScale(this.sceneWidth / backgroundWidth);

    const titleText: string = "Rapid Dominance";
    this.title = this.add.text(this.cameras.main.worldView.x + (this.sceneWidth / 2), (this.cameras.main.width * 0.125, this.cameras.main.height * 0.16666666666666666), titleText, {
      fontFamily: 'Arial',
      fontSize: '38px',
      color: '#000000',
    }).setOrigin(0.5);

    const gameModesDropdownOptions: DropdownOption[] = this.getGameModesDropdownOptions();
    const gameModesDropdown = new Dropdown(this, (this.cameras.main.width * 0.125, this.cameras.main.height * 0.16666666666666666), (this.cameras.main.width * 0.25, this.cameras.main.height * 0.3333333333333333), "menu_item", "Game mode",
      gameModesDropdownOptions,
      (selectedOption: string) => {
        this.changeGameMode(selectedOption);
      }
    );

    const numberOfPlayersDropdownOptions: DropdownOption[] = [];
    for (let i = 2; i <= (this.cameras.main.width * 0.02, this.cameras.main.height * 0.02666666666666667); i++) {
      numberOfPlayersDropdownOptions.push({
        text: `${i} players`,
        value: i.toString(),
        image: "menu_item"
      });
    }

    this.numberOfPlayersDropdown = new Dropdown(this, (this.cameras.main.width * 0.125, this.cameras.main.height * 0.16666666666666666), (this.cameras.main.width * 0.3125, this.cameras.main.height * 0.4166666666666667), "menu_item", "Players",
      numberOfPlayersDropdownOptions,
      (selectedOption: string) => {
        this.numberOfPlayers = parseInt(selectedOption);
        this.generateMapOptions();
      }
    );
    this.selectedModeLabel = new Dropdown(this, (this.cameras.main.width * 0.125, this.cameras.main.height * 0.16666666666666666), (this.cameras.main.width * 0.3125, this.cameras.main.height * 0.4166666666666667), "menu_item", this.selectedGameMode.name,
      [], () => { }
    );

    this.selectedMapDropdown = new Dropdown(this, (this.cameras.main.width * 0.125, this.cameras.main.height * 0.16666666666666666), (this.cameras.main.width * 0.375, this.cameras.main.height * 0.5), "menu_item", "Map",
      [],
      (selectedOption: string) => {
        this.selectedMap = selectedOption;
      }
    );

    const mapDropdown = this.selectedMapDropdown;

    this.startButton = new RoutingButton(this, (this.cameras.main.width * 0.0625, this.cameras.main.height * 0.08333333333333333), 0, "menu_item", "Start", 1,
      () => {
        if (this.numberOfPlayers !== 0 && this.selectedMap !== "") {
          this.scene.start("GameScene", { selectedMap: this.selectedMap, numberOfPlayers: this.numberOfPlayers, selectedGameMode: this.selectedGameMode });
        }
      }
    );

    this.add.container(0, 0, mapDropdown);
    this.add.container(0, (this.cameras.main.width * 0.4375, this.cameras.main.height * 0.5833333333333334), this.startButton);
    this.add.container(0, 0, this.selectedModeLabel);
    this.add.container(0, 0, this.numberOfPlayersDropdown);
    this.add.container(0, 0, gameModesDropdown);
    this.createFooter();
    this.changeMap();
  }

  changeMap() {
    this.map = this.make.tilemap({ key: this.selectedMap, tileWidth: filemapSettings.tileWidth, tileHeight: filemapSettings.tileHeight })
    this.tileset = this.map.addTilesetImage('eft_filemap', undefined, filemapSettings.tileWidth, filemapSettings.tileHeight, -2, -2)

    if (this.tileset) {
      let layer = this.map.createLayer(0, this.tileset, this.title.x - (this.tileset.tileWidth * 2), (this.cameras.main.width * 0.25, this.cameras.main.height * 0.3333333333333333))
      if (layer) {
        layer.setScale(0.2);
        layer.setAlpha(0.9)
      }
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
      if (gm === deathmatch) {
        this.selectedModeLabel.setVisible(false);
        this.numberOfPlayersDropdown.setVisible(true);
      } else {
        this.selectedModeLabel.setVisible(true);
        this.numberOfPlayersDropdown.setVisible(false);
        this.selectedModeLabel.destroy();
        this.selectedModeLabel = this.add.container(0, 0, new Dropdown(this, (this.cameras.main.width * 0.125, this.cameras.main.height * 0.16666666666666666), (this.cameras.main.width * 0.3125, this.cameras.main.height * 0.4166666666666667), "menu_item", this.selectedGameMode.name,
          [], () => { }
        ));
      }
      this.numberOfPlayers = this.selectedGameMode.getMaxNumberOfPlayers();
      this.generateMapOptions();
    }
  }


  generateMapOptions(): void {
    let opts = this.gameMaps
      .filter(map => map.maxPlayers >= this.numberOfPlayers)
      .map(map =>
      ({
        text: map.mapName,
        value: map.id,
        image: "menu_item"
      }));
    this.selectedMapDropdown.updateOptions(this, opts, (selectedOption: string) => {
      this.selectedMap = selectedOption;
      this.changeMap();
    });
  }

  update(time: number, delta: number): void {

  }

};
