import { Coordinates } from './../coordinates/coordinates';
export interface ArrowToDraw {
    boxCoordinates: Coordinates;
    direction: string;
    arrowStart: boolean;
    arrowEnd: boolean;
}
