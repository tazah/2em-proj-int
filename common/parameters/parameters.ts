export enum GameModeType {
    classic = 'Classique',
    log2990 = 'LOG2990',
}
export enum VirtualPlayerDifficulty {
    Beginner = 'Débutant',
    Expert = 'Expert',
}
export interface Parameters {
    dictionary: string;
    timer: number;
    creatorName: string;
    isBoxTypeRandom: boolean;
    mode: GameModeType;
    difficulty: VirtualPlayerDifficulty;
}
