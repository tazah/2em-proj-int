import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2/vec2';
import { A_ASCII, DEFAULT_BOX_HEIGHT, DEFAULT_BOX_WIDTH, HALF, HALF_COLUMN, HALF_ROW } from '@common/constants/constants';
import { Coordinates } from '@common/coordinates/coordinates';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    indexToPosition(index: string): Vec2 {
        const column: number = index[0].toUpperCase().charCodeAt(0) - (A_ASCII - 1);
        const row = Number(index.substr(1));
        const x: number = DEFAULT_BOX_WIDTH * (row - HALF);
        const y: number = DEFAULT_BOX_HEIGHT * (column - HALF);
        return { x, y };
    }

    positionToIndex(coordinates: Coordinates): string {
        return String.fromCharCode(A_ASCII + coordinates.row) + (coordinates.column + 1).toString();
    }

    coordinatesToPosition(coordinates: Coordinates): Vec2 {
        const x: number = DEFAULT_BOX_WIDTH * (coordinates.row - HALF);
        const y: number = DEFAULT_BOX_HEIGHT * (coordinates.column - HALF);
        return { x, y };
    }

    positionToCoordinates(position: Vec2): Coordinates {
        const column: number = Math.floor(position.x / (DEFAULT_BOX_WIDTH - HALF_COLUMN));
        const row: number = Math.floor(position.y / (DEFAULT_BOX_HEIGHT - HALF_ROW));
        return { row, column };
    }
}
