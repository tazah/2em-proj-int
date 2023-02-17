import { Component, OnInit } from '@angular/core';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';
import { VisualManipulationService } from '@app/services/visual-manipulation-service/visual-manipulation.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';

@Component({
    selector: 'app-left-sidebar',
    templateUrl: './left-sidebar.component.html',
    styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit {
    isTryingAbandon: boolean;

    constructor(
        public localGameHandler: LocalGameHandlerService,
        public roomService: RoomService,
        public drawService: DrawService,
        public visualManipulationService: VisualManipulationService,
        public visualPlacementService: VisualPlacementService,
    ) {
        this.isTryingAbandon = false;
    }

    ngOnInit() {
        this.roomService.updateTimer();
    }

    abandonGame(): void {
        this.roomService.abandonGame();
    }

    openDialog() {
        if (confirm('Voulez-vous vraiment abandonner le jeu ? ')) {
            this.abandonGame();
        }
    }
}
