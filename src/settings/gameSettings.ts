export const maxPlayersNumber = 16;

export const mapSizeX = 20
export const mapSizeY = 20

export const actionPointGainPerRound = 8
export const actionPointGainPerRoundFromInnerFields = 0.02
export const actionPointGainPerRoundFromOuterFields = 0.01
export const actionPointGainPerRoundForAdditionalTownhall = 1


export const goldGainPerRound = 5
export const goldGainPerRoundForMine = Math.floor(Math.random() * 5 + 4) // from 4 to 8
export const goldGainPerRoundForMineOnDeposit = Math.floor(Math.random() * 5 + 16)// from 8 to 16

export const armyGrowthAfterFailedEnemyAttacks = 0.5

export const initalTroops = 10 
export const initalGold = 200

export const fieldAttackAPCost = 2
export const fieldLeaveAPCost = 1

export const fieldAttack = 1
export const fieldTakeover = 1.5
export const constructionOfTheBuilding = 0.5
export const destructionOfTheTownHall = 15
export const destructionOfTheBarracks = 10
export const mineDestruction = 10
export const destructionOfTheObservationTower = 5
export const destructionOfTheWoodenWall = 8
export const destructionOfTheStoneWall = 15
export const eliminatingAPlayer = 20
//All numbers refer to enemy sectors/buildings. Only 25% of the given experience is allocated for the corresponding sector/neutral building.

export const barrackProductivity = 20
export const barrackProductivityAlreadyOwnedBarracks = 2
export const barrackProductivityAlreadyOwnedDamagedBarracks = 1

export const initialActionPoints = 8
export const initialActionPointsLimit = 14
export const actionPointLimit = 200
export const armyLimit = 200
export const goldLimit = 20000

export const barrackGoldCost = 100
export const mineGoldCost = 150
export const woodenWallGoldCost = 100
export const stoneWallGoldCost = 200
export const townhallGoldCost = 500

export const barrackActionPointCost = 4
export const mineActionPointCost = 4
export const woodenWallActionPointCost = 4
export const stoneWallActionPointCost = 6
export const townhallActionPointCost = 8

export const townhallResistance = 4
export const mineResistance = 2
export const barrackResistance = 2
export const woodenWallResistance = 4
export const stoneWallResistance = 8
export const observationTowerResistance = 2
export const blankFieldResistance = 1

