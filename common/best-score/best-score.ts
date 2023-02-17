export enum BestScoreMode {
    Classic = 'Classic',
    Log = 'Log',
}

export interface BestScore {
    playerName: string;
    score: number;
}

export interface FirstFiveBestScores {
    playerNames: string[];
    score: number;
}

export interface PlayerInfo {
    name: string;
    score: number;
}
