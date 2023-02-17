import { Box } from './../box/box';

export interface NewLetterToPlace {
    columnIndex: number;
    rowIndex: number;
    letter: string;
    board: Box[][];
}
