import { Coordinates } from '../coordinates/coordinates';

export interface PotentialWord {
    word: string;
    score: number;
    startPosition: Coordinates;
}
