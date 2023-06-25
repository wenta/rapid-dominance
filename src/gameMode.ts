export default class GameMode {
    numberOfTeams: number
    playersPerTeams: number
    name: string

    constructor(numberOfTeams: number, playersPerTeams: number, gmn: string = "Deathmatch") {
        this.numberOfTeams = numberOfTeams;
        this.playersPerTeams = playersPerTeams;
        this.name = gmn;
    }

    getMaxNumberOfPlayers(): number {
        return this.numberOfTeams * this.playersPerTeams;
    }
}

export const deathmatch = new GameMode(16, 1);
export const t2p2 = new GameMode(2, 2, "2 teams x 2 players");
export const t3p2 = new GameMode(3, 2, "3 teams x 2 players");
export const t4p2 = new GameMode(4, 2, "4 teams x 2 players");
export const t5p2 = new GameMode(5, 2, "5 teams x 2 players");
export const t6p2 = new GameMode(6, 2, "6 teams x 2 players");
export const t7p2 = new GameMode(7, 2, "7 teams x 2 players");
export const t8p2 = new GameMode(8, 2, "8 teams x 2 players");
export const t2p3 = new GameMode(2, 3, "2 teams x 3 players");
export const t2p4 = new GameMode(2, 4, "2 teams x 4 players");
export const t2p5 = new GameMode(2, 5, "2 teams x 5 players");
export const t2p6 = new GameMode(2, 6, "2 teams x 6 players");
export const t2p7 = new GameMode(2, 7, "2 teams x 7 players");
export const t2p8 = new GameMode(2, 8, "2 teams x 8 players"); 