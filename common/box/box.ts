import { Coordinates } from './../coordinates/coordinates';

export enum ScoreType {
    Letter = 'Letter',
    Word = 'Word',
}
export enum ScoreCoefficient {
    Double = 2,
    Triple = 3,
    Normal = 1,
}
export interface BoxType {
    type: ScoreType;
    value: ScoreCoefficient;
}
export interface Box {
    letter: string;
    coordinates: Coordinates;
    boxType: BoxType;
}
