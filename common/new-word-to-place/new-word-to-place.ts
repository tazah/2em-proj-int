import { Box } from './../box/box';
import { WordOnBoard } from './../word-placement/word-placement';

export interface NewWordToPlace {
    potentialWord: string;
    wordOnBoard: WordOnBoard;
    rowIndex: number;
    board: Box[][];
}
