import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';
import { FIVE_MINUTES, THIRTY_SECONDS } from '@common/constants/constants';
import { DictionaryInfo } from '@common/dictionary/dictionary';
import { MatchType } from '@common/match/match';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { Player } from '@common/player/player';
import { VirtualPlayerDifficulty } from './../../../../../common/parameters/parameters';

@Component({
    selector: 'app-create-multiplayer-match-page',
    templateUrl: './create-multiplayer-match-page.component.html',
    styleUrls: ['./create-multiplayer-match-page.component.scss'],
})
export class CreateMultiplayerMatchPageComponent implements OnInit {
    userName: string;
    matchTime: number;
    player: Player;
    isNameInputValid: boolean;
    isTimerInputValid: boolean;
    availableDictionaries: DictionaryInfo[];
    selectedDictionary: DictionaryInfo;
    difficultyLevels: VirtualPlayerDifficulty[];

    constructor(
        private router: Router,
        private roomService: RoomService,
        public localGameHandler: LocalGameHandlerService,
        private communicationService: CommunicationService,
    ) {
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.player = {
            name: '',
            score: 0,
            tray: [],
            roomId: -1,
            socketId: '',
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        this.localGameHandler.isRandomBoxTypes = false;
        this.userName = '';
        this.isNameInputValid = true;
        this.isTimerInputValid = true;
        this.availableDictionaries = [];
        this.selectedDictionary = { title: 'Mon dictionnaire', description: 'Description de base' };
        this.difficultyLevels = [VirtualPlayerDifficulty.Beginner, VirtualPlayerDifficulty.Expert];
    }

    ngOnInit(): void {
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.player = {
            name: '',
            score: 0,
            tray: [],
            roomId: -1,
            socketId: '',
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        this.isNameInputValid = true;
        this.isTimerInputValid = true;
        this.matchTime = 60;
        this.localGameHandler.isRandomBoxTypes = false;
        this.difficultyLevels = [VirtualPlayerDifficulty.Beginner, VirtualPlayerDifficulty.Expert];
        this.refreshDictionariesList();
    }

    refreshDictionariesList(): void {
        this.communicationService.dictionariesGet().subscribe((dictionaries) => {
            this.availableDictionaries = dictionaries;
            const defaultDictionary = dictionaries.find((dict) => dict.title === 'Mon dictionnaire');
            if (defaultDictionary !== undefined) this.selectedDictionary = defaultDictionary;
        });
    }

    parameterValidation(name: string, time: number): void {
        this.isNameInputValid = this.isNameParameterValid(name);
        this.isTimerInputValid = this.isTimerParameterValid(time);
        if (!this.isNameInputValid) return;

        if (!this.isTimerInputValid) {
            return;
        }

        this.communicationService.dictionaryGet(this.selectedDictionary.title).subscribe(
            (dictionary) => {
                if (dictionary && dictionary.title === this.selectedDictionary.title) {
                    this.localGameHandler.match.parameters.timer = this.matchTime;

                    this.localGameHandler.match.players[0].name = name;
                    this.localGameHandler.match.type = MatchType.Multiplayer;
                    this.startGame(this.userName);
                } else {
                    this.openDialog("Le dictionnaire choisi n'existe plus. Veuillez resélectionner un autre dictionnaire.");
                    this.refreshDictionariesList();
                }
            },
            () => {
                this.openDialog("Le dictionnaire choisi n'existe plus. Veuillez resélectionner un autre dictionnaire.");
                this.refreshDictionariesList();
            },
        );
    }

    isNameParameterValid(name: string): boolean {
        const regexFormat = new RegExp('^[a-z0-9A-Z]{3,8}$');

        return regexFormat.test(name);
    }

    isTimerParameterValid(time: number): boolean {
        return time >= THIRTY_SECONDS && time <= FIVE_MINUTES;
    }

    openDialog(message: string): void {
        alert(message);
    }

    startGame(userName: string): void {
        this.localGameHandler.initialParameters.difficulty = VirtualPlayerDifficulty.Beginner;
        this.roomService.localGame.initialParameters.dictionary = this.selectedDictionary.title;
        this.roomService.startMultiPlayerGame(userName);
        this.router.navigateByUrl('/waitingRoom');
    }
}
