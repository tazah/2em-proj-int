export enum GameType {
    Solo = 'Solo',
    Multiplayer = 'Multiplayer',
    Unspecified = 'Unspecified',
}

export interface GameInfo {
    isGameStarted: boolean;
    gameType: GameType;
}
