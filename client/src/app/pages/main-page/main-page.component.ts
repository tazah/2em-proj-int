import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RoomService } from '@app/services/room-service/room.service';
import { GameModeType } from './../../../../../common/parameters/parameters';
import { BestScoresPageComponent } from './../best-scores-page/best-scores-page.component';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string;

    constructor(private roomService: RoomService, public dialog: MatDialog) {
        this.roomService.socketInit();
        this.title = 'jeu';
    }

    openDialog() {
        this.dialog.open(BestScoresPageComponent);
    }

    setGameModeType(gameModeType: number): void {
        this.roomService.localGame.initialParameters.mode = gameModeType === 0 ? GameModeType.classic : GameModeType.log2990;
    }
}
