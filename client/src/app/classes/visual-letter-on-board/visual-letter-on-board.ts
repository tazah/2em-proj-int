export enum LetterState {
    WasAlreadyOnBoard,
    PlacedOnBoard,
    WhiteLetter,
}

export interface VisualLetterOnBoard {
    letter: string;
    state: LetterState;
}
