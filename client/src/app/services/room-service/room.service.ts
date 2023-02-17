import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '@app/classes/room/room';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';
import { Box } from '@common/box/box';
import { INDEX_NOT_FOUND, MEDIUM_TICK, SMALL_TICK, TEST_INTERVAL } from '@common/constants/constants';
import { MatchListElement } from '@common/match-list-element/match-list-element';
import { Match, MatchType } from '@common/match/match';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { Player } from '@common/player/player';
import { Subject } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    selectedRoom: number;
    availableRooms: MatchListElement[];
    chatSubject: Subject<void>;
    interval: NodeJS.Timeout;
    socket: io.Socket;
    player: Player;
    private room: Room;
    private isRoomJoined: boolean;

    private readonly hostName: string;

    constructor(public localGame: LocalGameHandlerService, private router: Router, private visualPlacementService: VisualPlacementService) {
        this.availableRooms = [];
        this.selectedRoom = -1;
        this.room = {
            roomId: -1,
            players: new Array<Player>(2),
            gameType: 0,
        };
        this.hostName = environment.socketUrl;
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

        this.socket = io.connect(this.hostName, { forceNew: true });
        this.chatSubject = new Subject();
        this.isRoomJoined = false;
        this.selectedRoom = -1;
    }

    socketInit(): void {
        this.socket.on('joinModeSolo', (roomInfo: number) => {
            if (!this.isRoomJoined) {
                this.room.roomId = roomInfo;
                this.player.roomId = roomInfo;
                this.isRoomJoined = true;
            }
        });

        this.socket.on('return to home page', () => {
            this.router.navigateByUrl('/');
        });

        this.socket.on('joinModeMultiPlayer', (roomInfo: number) => {
            if (!this.isRoomJoined) {
                this.room.roomId = roomInfo;
                this.player.roomId = roomInfo;
                this.isRoomJoined = true;
            }
        });

        this.socket.on('Game Initialized', (matchInfo: Match, bank: string, board: Box[][]) => {
            this.localGame.match = matchInfo;
            this.localGame.player = matchInfo.players[0];
            this.localGame.maxTimer = matchInfo.parameters.timer;
            this.localGame.bank = new Map(JSON.parse(bank));
            this.localGame.board = board;
        });

        this.socket.on('update chatBoxHistory', (players: Player[], activePlayer: number) => {
            this.localGame.match.players = players;
            this.localGame.match.activePlayer = activePlayer;
            if (this.localGame.isSecondPlayer && this.localGame.match.type === MatchType.Multiplayer) this.localGame.swapPlayers();
            this.localGame.chatHistory = this.localGame.match.players[0].chatHistory;
            setTimeout(() => {
                this.chatSubject.next();
            }, SMALL_TICK);
        });

        this.socket.on('game updated', (matchInfo: Match, bank: string, board: Box[][]) => {
            this.localGame.match = matchInfo;

            if (this.localGame.isSecondPlayer && this.localGame.match.type === MatchType.Multiplayer) this.localGame.swapPlayers();
            this.localGame.bank = new Map(JSON.parse(bank));
            this.localGame.board = board;
            setTimeout(() => {
                this.chatSubject.next();
            }, SMALL_TICK);
            this.visualPlacementService.initializeVisualPlacement();
            if (this.room.gameType === 0 || this.localGame.match.type === MatchType.Solo) {
                this.localGame.chatHistory = matchInfo.players[0].chatHistory;
            }
        });

        this.socket.on('timer updated', (timer: number, activePlayer: number, match: Match) => {
            if (match !== undefined && match.gameOver) {
                this.localGame.match = match;
            }
            if (timer === this.localGame.maxTimer || timer === this.localGame.maxTimer - 1) {
                this.socket.emit('update turn');
                this.localGame.match.activePlayer = activePlayer;
                if (this.localGame.isSecondPlayer) this.localGame.swapPlayers();
            }

            this.localGame.match.parameters.timer = timer;
        });

        this.socket.on('collect available rooms', (availableRooms: MatchListElement[]) => {
            this.availableRooms = availableRooms;
        });

        this.socket.on('MultiPlayerGame Initialized', (match: Match, bank: string, board: Box[][]) => {
            this.localGame.maxTimer = match.parameters.timer;
            this.localGame.match = match;

            this.localGame.bank = new Map(JSON.parse(bank));
            this.localGame.board = board;
        });

        this.socket.on('GoToGamePage', () => {
            this.router.navigateByUrl('/game');
        });

        this.socket.on('join second player', (match: Match, bank: string, board: Box[][]) => {
            this.localGame.isSecondPlayer = true;

            this.localGame.match = match;

            this.localGame.bank = new Map(JSON.parse(bank));
            this.localGame.board = board;
        });

        this.socket.on('game abandonned', () => {
            this.isRoomJoined = false;
            this.localGame.resetLocalGame();
            clearInterval(this.interval as NodeJS.Timeout);
        });
        this.socket.on('you have won', (match: Match) => {
            this.localGame.match = match;
            this.localGame.chatHistory = match.players[match.winner].chatHistory;
        });
    }

    getChatObservable() {
        return this.chatSubject.asObservable();
    }

    leaveWaitingRoom(): void {
        this.socket.emit('leave waiting room');
    }

    switchToSoloMode(): void {
        if (this.room.roomId !== INDEX_NOT_FOUND) {
            this.room.gameType = 0;
            this.socket.emit('switch to solo game', this.localGame.initialParameters.difficulty);
            this.isRoomJoined = true;
        }
    }

    startGame(name: string): void {
        this.player.name = name;
        this.socket.emit('startModeSoloGame', name, this.localGame.initialParameters);
    }

    startMultiPlayerGame(name: string): void {
        this.player.name = name;
        this.socket.emit('startModeMultiPlayerGame', name, this.localGame.initialParameters);
    }

    initializeGameModeMultiPlayer(player: Player, roomId: number): void {
        this.socket.emit('initialize Mode MultiPlayer Game', player, roomId);
    }

    sendMessage(message: string): void {
        this.socket.emit('treat command', this.player, message);
    }

    getAvailableMultiPlayerMatches(): void {
        setInterval(() => {
            this.socket.emit('available Matches', this.localGame.initialParameters.mode);
        }, TEST_INTERVAL);
    }

    joinMultiPlayerGame(roomId: number): void {
        this.socket.emit('join a multiPlayerGame', roomId);
    }

    updateTimer(): void {
        this.interval = setInterval(() => {
            this.socket.emit('updateTimer');
        }, MEDIUM_TICK);
    }

    abandonGame(): void {
        if (!this.localGame.match.gameOver) this.socket.emit('abandon game');
        this.isRoomJoined = false;
        this.room = {
            roomId: -1,
            players: [],
            gameType: 0,
        };
        this.router.navigateByUrl('');
    }
}
