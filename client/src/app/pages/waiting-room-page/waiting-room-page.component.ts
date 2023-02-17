import { Component } from '@angular/core';
import { RoomService } from '@app/services/room-service/room.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    constructor(public roomService: RoomService) {}

    abandonWaitingRoom(): void {
        this.roomService.leaveWaitingRoom();
    }
}
