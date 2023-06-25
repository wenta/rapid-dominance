import Dropdown, { DropdownOption } from './components/dropdown';
import { RoutingButton } from './components/routingButton';
import * as filemapSettings from './settings/filemapSettings';
import { backgroundWidth, buttonHeight, buttonWidth } from './settings/textureSettings';

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
  p: number = 0
  selectedMap: string = ""
  selectedMapDropdown: Dropdown
  aboutButton: RoutingButton
  instructionButton: RoutingButton
  startButton: RoutingButton

  pm: GameMaps[] = [{ mapName: 'Eagles Nest', id: 'eagles_nest', maxPlayers: 4 },
  { mapName: 'Eight', id: 'eight', maxPlayers: 8 },
  { mapName: 'Hex', id: 'hex', maxPlayers: 16 },
  { mapName: 'Stone', id: 'stones', maxPlayers: 16 }];



  constructor() {
    super({
      key: "WelcomeScene"
    });
  }

  preload(): void {
    this.load.setBaseURL(".");
    this.load.image("menu_item", "assets/buttonLong_brown.png");
    this.load.image("background", "assets/backgroundColorDesert.png");
  }

  createFooter() {
    let footerY = this.sceneHeight - (2 * buttonHeight)
    this.aboutButton = new RoutingButton(this, 0, 0, "menu_item", "About", 1,
      () => this.scene.start("AboutScene", {}));


    this.instructionButton = new RoutingButton(this, buttonWidth, 0, "menu_item", "Instruction", 1,
      () => this.scene.start("InstructionScene", {}));


    this.add.container(0, footerY, [this.aboutButton, this.instructionButton])
      .setScale(0.7)
      .setX(this.cameras.main.worldView.x + (this.sceneWidth / 4));
  }

  create(): void {
    this.sceneWidth = this.cameras.main.width;
    this.sceneHeight = this.cameras.main.height;

    this.add.sprite(0, 0, 'background').setOrigin(0).setScale(this.sceneWidth / backgroundWidth);

    var titleText: string = "Rapid Dominance";
    this.title = this.add.text(this.cameras.main.worldView.x + (this.sceneWidth / 2), 100, titleText, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#000000',
    }).setOrigin(0.5);

    const numberOfPlayersDropdownOptions: DropdownOption[] = []
    for (let i = 2; i <= 16; i++) {
      numberOfPlayersDropdownOptions.push({
        text: `${i} players`,
        value: i.toString(),
        image: "menu_item"
      });
    }
    const numberOfPlayersDropdown = this.add.container(0, 0, new Dropdown(this, 100, 200, "menu_item", "Players",
      numberOfPlayersDropdownOptions,
      (selectedOption: string) => {
        this.p = parseInt(selectedOption);
        this.generateMapOptions();
      }
    ));

    this.selectedMapDropdown = new Dropdown(this, 300, 200, "menu_item", "Map",
      [],
      (selectedOption: string) => {
        this.selectedMap = selectedOption;
      }
    )
    const mapDropdown = this.add.container(0, 0, this.selectedMapDropdown);
    this.add.container(0, 0, numberOfPlayersDropdown);
    this.add.container(0, 0, mapDropdown);
    this.startButton = new RoutingButton(this, 0, 0, "menu_item", "Start", 1,
      () => {
        if (this.p !== 0 && this.selectedMap !== "") {
          this.scene.start("GameScene", { selectedMap: this.selectedMap, numberOfPlayers: this.p });
        }
      }

    );


    this.add.container(400, 200, this.startButton);
    this.createFooter();



  }

  generateMapOptions(): void {
    let opts = this.pm
      .filter(map => map.maxPlayers >= this.p)
      .map(map =>
      ({
        text: map.mapName,
        value: map.id,
        image: "menu_item"
      }));
    this.selectedMapDropdown.updateOptions(this, opts, (selectedOption: string) => {
      this.selectedMap = selectedOption;
    });
  }

  update(time: number, delta: number): void {

  }

};
