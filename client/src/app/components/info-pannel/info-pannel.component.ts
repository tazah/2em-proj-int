import { Component, OnInit } from '@angular/core';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';

@Component({
    selector: 'app-info-pannel',
    templateUrl: './info-pannel.component.html',
    styleUrls: ['./info-pannel.component.scss'],
})
export class InfoPannelComponent implements OnInit {
    constructor(public localGameHandler: LocalGameHandlerService, public roomService: RoomService) {}

    ngOnInit() {
        this.roomService.updateTimer();
    }
}
