import { Component } from '@angular/core';

export enum Position {
    Board,
    Tray,
    Bank,
}

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent {
    letter: string;
    weight: number;
}
