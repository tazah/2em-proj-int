import { Component } from '@angular/core';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';
import { VirtualPlayerDifficulty } from '@common/parameters/parameters';

@Component({
    selector: 'app-chose-virtual-player-mode-page',
    templateUrl: './chose-virtual-player-mode-page.component.html',
    styleUrls: ['./chose-virtual-player-mode-page.component.scss'],
})
export class ChoseVirtualPlayerModePageComponent {
    difficultyLevels: VirtualPlayerDifficulty[];
    constructor(public roomService: RoomService, public localGameHandler: LocalGameHandlerService) {
        this.difficultyLevels = [VirtualPlayerDifficulty.Beginner, VirtualPlayerDifficulty.Expert];
    }

    switchToSoloMode() {
        this.roomService.switchToSoloMode();
    }
}
