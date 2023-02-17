import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room-service/room.service';
import { MatchListElement } from '@common/match-list-element/match-list-element';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { Player } from '@common/player/player';

@Component({
    selector: 'app-second-player-parameters-page',
    templateUrl: './second-player-parameters-page.component.html',
    styleUrls: ['./second-player-parameters-page.component.scss'],
})
export class SecondPlayerParametersPageComponent implements OnInit {
    userName: string;
    isNameInputValid: boolean;
    isSameName: boolean;
    isMatchAvailable: boolean;

    constructor(private roomService: RoomService, private router: Router) {
        this.userName = '';
        this.isNameInputValid = true;
        this.isSameName = false;
        this.isMatchAvailable = true;
    }

    ngOnInit(): void {
        this.userName = '';
        this.isNameInputValid = true;
        this.isSameName = false;
    }

    isNameParameterValid(name: string): boolean {
        const regexFormat = new RegExp('^[a-z0-9A-Z]{3,8}$');
        return regexFormat.test(name);
    }

    parameterValidation(name: string): void {
        this.isNameInputValid = this.isNameParameterValid(name);
        this.roomService.getAvailableMultiPlayerMatches();
        const matches: MatchListElement[] = this.roomService.availableRooms.filter((match) => {
            return match.roomId === this.roomService.selectedRoom;
        });

        this.isMatchAvailable = matches.length > 0;
        if (!this.isMatchAvailable) this.roomService.selectedRoom = -1;

        this.isSameName = this.verifySecondPlayerName(name);
        if (!this.isNameInputValid || this.isSameName || !this.isMatchAvailable) return;
        this.joinGame();
    }

    verifySecondPlayerName(name: string): boolean {
        const creatorName = this.roomService.availableRooms.find((room) => room.roomId === this.roomService.selectedRoom)?.creatorName;
        this.isSameName = name === creatorName ? true : false;
        return this.isSameName;
    }

    joinGame(): void {
        this.roomService.joinMultiPlayerGame(this.roomService.selectedRoom);
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };

        const player: Player = {
            name: this.userName,
            roomId: this.roomService.selectedRoom,
            gameType: 1,
            score: 0,
            socketId: this.roomService.player.socketId,
            tray: this.roomService.player.tray,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        this.roomService.localGame.isSecondPlayer = true;
        this.roomService.initializeGameModeMultiPlayer(player, this.roomService.selectedRoom);
        this.router.navigateByUrl('/game');
        this.roomService.localGame.player.name = player.name;
    }

    cancelJoin(): void {
        this.roomService.selectedRoom = -1;
    }
}
