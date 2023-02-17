import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room-service/room.service';
import { MatchListElement } from '@common/match-list-element/match-list-element';

@Component({
    selector: 'app-join-multiplayer-match-page',
    templateUrl: './join-multiplayer-match-page.component.html',
    styleUrls: ['./join-multiplayer-match-page.component.scss'],
})
export class JoinMultiplayerMatchPageComponent implements AfterViewInit, OnInit {
    displayedColumns: string[];
    clickedRow: Set<MatchListElement>;
    existingMatches: MatchListElement[];

    constructor(private router: Router, public roomService: RoomService) {
        this.existingMatches = [];
        this.displayedColumns = ['roomId', 'creatorName', 'dictionaryUsed', 'timerUsed', 'isRandomModeOn'];
        this.clickedRow = new Set<MatchListElement>();
    }

    ngOnInit(): void {
        this.roomService.getAvailableMultiPlayerMatches();
        this.existingMatches = this.roomService.availableRooms;
        return;
    }

    ngAfterViewInit(): void {
        this.existingMatches = this.roomService.availableRooms;
    }

    chooseRandomGame(): void {
        this.existingMatches = this.roomService.availableRooms;
        const randomMatchChoice = this.existingMatches[Math.floor(Math.random() * this.existingMatches.length)];
        this.roomService.selectedRoom = randomMatchChoice.roomId;
        this.router.navigateByUrl('/confirmJoin');
    }

    selectRoom(roomId: number): void {
        this.roomService.selectedRoom = roomId;
    }
}
