import { Box } from './../box/box';

export interface WordToPlace {
    transposedBoard: Box[][];
    word: string;
    column: number;
    row: number;
}
