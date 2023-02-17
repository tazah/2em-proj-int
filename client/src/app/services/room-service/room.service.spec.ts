/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Room } from '@app/classes/room/room';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';
import { Box } from '@common/box/box';
import { ChatAuthor } from '@common/chat/chat';
import { LONG_TICK, MEDIUM_TICK, ONE_MINUTE, SMALL_TICK } from '@common/constants/constants';
import { MatchListElement } from '@common/match-list-element/match-list-element';
import { Match, MatchType, State } from '@common/match/match';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { Player } from '@common/player/player';
import { RoomService } from './room.service';

// eslint-disable-next-line @typescript-eslint/ban-types
type CallbackSignature = (...params: unknown[]) => {};

class SocketMock {
    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)?.push(callback);
    }

    disconnect(): void {
        return;
    }

    emit(event: string, ...params: unknown[]): void {
        return;
    }

    peerSideEmit(event: string, ...params: any) {
        if (!this.callbacks.has(event)) {
            return;
        }
        for (const callback of this.callbacks.get(event)!) {
            callback(...params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}

describe('RoomService', () => {
    let service: RoomService;
    let localGame: LocalGameHandlerService;
    let visualPlacementService: VisualPlacementService;
    let bank: string;
    let matchInfo: Match;
    let board: Box[][];
    let socket: any;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RoomService, DrawService, { provide: Router, useValue: routerMock }],
        });
        service = TestBed.inject(RoomService);
        localGame = TestBed.inject(LocalGameHandlerService);
        visualPlacementService = TestBed.inject(VisualPlacementService);

        socket = new SocketMock();
        service.socket = socket;

        service.socketInit();

        jasmine.clock().install();

        const stat: State = 1;
        const typ: MatchType = 1;
        board = [];
        const parameter: Parameters = {
            dictionary: '',
            timer: 60,
            creatorName: '',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        const player1Objective: Objective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };
        const player2Objective: Objective = {
            index: 1,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };
        const player1: Player = {
            tray: [],
            name: 'test1',
            score: 1,
            socketId: '2',
            roomId: 1,
            gameType: 1,
            debugOn: true,
            chatHistory: [],
            privateOvjective: player1Objective,
        };
        const player2: Player = {
            tray: [],
            name: 'test',
            score: 2,
            socketId: '3',
            roomId: 1,
            gameType: 1,
            debugOn: true,
            chatHistory: [],
            privateOvjective: player2Objective,
        };
        const publicObjectives: Objective[] = [
            {
                index: 2,
                description: '',
                name: '',
                type: ObjectiveType.Private,
                isReached: false,
                score: 0,
                isPicked: false,
            },
        ];
        matchInfo = {
            players: [player1, player2],
            activePlayer: 1,
            mode: '',
            state: stat,
            type: typ,
            parameters: parameter,
            debugOn: true,
            winner: 1,
            gameOver: false,
            numberOfConsecutivePasses: 1,
            numberOfTotalPasses: 1,
            wordsOnBoard: [],
            boardConfiguration: '',
            publicObjectives,
        };
        bank = '[["a",{"quantity":8,"weight":1}]]';
    });

    afterEach(() => {
        jasmine.clock().uninstall();
        localGame.match.gameOver = true;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true on joinModeSolo', () => {
        service['isRoomJoined'] = false;
        socket.peerSideEmit('joinModeSolo', 0);
        expect(service['isRoomJoined']).toBe(true);
    });

    it('should joinModeSolo case else', () => {
        service['isRoomJoined'] = true;
        socket.peerSideEmit('joinModeSolo', 0);
        expect(service['isRoomJoined']).toBe(true);
    });

    it('should joinModeMultiPlayer', () => {
        service['isRoomJoined'] = false;
        socket.peerSideEmit('joinModeMultiPlayer', 0);
        expect(service['isRoomJoined']).toBe(true);
    });

    it('should joinModeMultiPlayer case else', () => {
        service['isRoomJoined'] = true;
        socket.peerSideEmit('joinModeMultiPlayer', 0);
        expect(service['isRoomJoined']).toBe(true);
    });

    it('should set the timer on Game Initialized', () => {
        socket.peerSideEmit('Game Initialized', matchInfo, bank, board);
        expect(localGame.maxTimer).toEqual(ONE_MINUTE);
    });

    it('should not call swapPlayers on update chatBoxHistory', () => {
        const chat = { message: 'hi', author: ChatAuthor.Player };
        const player1Objective: Objective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };

        const player1: Player = {
            tray: [],
            name: 'test1',
            score: 1,
            socketId: '2',
            roomId: 1,
            gameType: 1,
            debugOn: true,
            chatHistory: [chat],
            privateOvjective: player1Objective,
        };
        localGame.chatHistory = [];
        localGame.isSecondPlayer = true;
        spyOn(localGame, 'swapPlayers');
        socket.peerSideEmit('update chatBoxHistory', [player1]);
        jasmine.clock().tick(SMALL_TICK);
        expect(localGame.swapPlayers).not.toHaveBeenCalled();
    });

    it('should not call swapPlayers on update chatBoxHistory if not secondPlayer', () => {
        const chat = { message: 'hi', author: ChatAuthor.Player };
        const player1Objective: Objective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };

        const player1: Player = {
            tray: [],
            name: 'test1',
            score: 1,
            socketId: '2',
            roomId: 1,
            gameType: 1,
            debugOn: true,
            chatHistory: [chat],
            privateOvjective: player1Objective,
        };
        localGame.chatHistory = [];
        localGame.isSecondPlayer = false;
        spyOn(localGame, 'swapPlayers');
        socket.peerSideEmit('update chatBoxHistory', [player1]);
        expect(localGame.swapPlayers).not.toHaveBeenCalled();
    });

    it('should call swapPlayers on update chatBoxHistory if isSecondPlayer is true & MatchType is Multiplayer', () => {
        const chat = { message: 'hi', author: ChatAuthor.Player };
        const player1Objective: Objective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };

        const player1: Player = {
            tray: [],
            name: 'test1',
            score: 1,
            socketId: '2',
            roomId: 1,
            gameType: 1,
            debugOn: true,
            chatHistory: [chat],
            privateOvjective: player1Objective,
        };
        localGame.chatHistory = [];
        localGame.isSecondPlayer = true;
        spyOn(localGame, 'swapPlayers');
        localGame.match.type = MatchType.Multiplayer;
        localGame.isSecondPlayer = true;
        socket.peerSideEmit('update chatBoxHistory', [player1]);
        jasmine.clock().tick(SMALL_TICK);
        expect(localGame.swapPlayers).toHaveBeenCalled();
    });

    it('should call initializeVisualPlacement() on  game updated', () => {
        spyOn(visualPlacementService, 'initializeVisualPlacement');
        socket.peerSideEmit('game updated', matchInfo, bank, board);
        jasmine.clock().tick(SMALL_TICK);
        expect(visualPlacementService.initializeVisualPlacement).toHaveBeenCalled();
    });
    it('should call swapPlayers()  game updated if isSecondPlayer is true', () => {
        localGame.isSecondPlayer = true;
        service['room'].gameType = 1;
        spyOn(localGame, 'swapPlayers');
        socket.peerSideEmit('game updated', matchInfo, bank, board);
        expect(localGame.swapPlayers).toHaveBeenCalled();
    });

    it('should set timer on timer updated', () => {
        localGame.maxTimer = 60;
        service.localGame.isSecondPlayer = true;
        socket.peerSideEmit('timer updated', ONE_MINUTE);
        expect(localGame.match.parameters.timer).toBe(ONE_MINUTE);
    });

    it('should not call swapPlayers on timer updated if isSecondPlayer is false  ', () => {
        localGame.maxTimer = 60;
        localGame.match.parameters.timer = 0;
        service.localGame.isSecondPlayer = false;
        spyOn(localGame, 'swapPlayers');
        socket.peerSideEmit('timer updated', ONE_MINUTE);
        expect(localGame.swapPlayers).not.toHaveBeenCalled();
    });

    it('should not emit a socket on  timer updated if timer != maxTimer', () => {
        service.localGame.isSecondPlayer = false;
        localGame.maxTimer = 50;
        spyOn(service.socket, 'emit');
        socket.peerSideEmit('timer updated', ONE_MINUTE);
        expect(service.socket.emit).not.toHaveBeenCalled();
    });

    it('should not emit a socket on timer updated if game over', () => {
        service.localGame.isSecondPlayer = false;

        localGame.maxTimer = 50;
        spyOn(service.socket, 'emit');
        socket.peerSideEmit('timer updated', ONE_MINUTE);
        expect(service.socket.emit).not.toHaveBeenCalled();
    });

    it('should set a availableRooms on collect available rooms', () => {
        const availableRooms: MatchListElement[] = [];
        spyOn(service.socket, 'emit');
        socket.peerSideEmit('collect available rooms', availableRooms);
        expect(service.availableRooms).toBe(availableRooms);
    });

    it('should set the board on MultiPlayerGame Initialized', () => {
        spyOn(service.socket, 'emit');
        socket.peerSideEmit('MultiPlayerGame Initialized', matchInfo, bank, board);
        expect(localGame.board).toBe(board);
    });

    it('should call navigateByUrl on GoToGamePage', () => {
        const availableRooms: MatchListElement[] = [];
        spyOn(service['router'], 'navigateByUrl');
        socket.peerSideEmit('GoToGamePage', availableRooms);
        expect(service['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should set the board on join second player', () => {
        socket.peerSideEmit('join second player', matchInfo, bank, board);
        expect(localGame.board).toBe(board);
    });
    it('should set matchInfo on you have won', () => {
        socket.peerSideEmit('you have won', matchInfo);
        expect(service.localGame.match).toBe(matchInfo);
    });
    it('should reset the game on game abandonned', () => {
        const game: LocalGameHandlerService = new LocalGameHandlerService();

        socket.peerSideEmit('game abandonned');
        expect(service.localGame).toEqual(game);
    });
    it('should call navigateByUrl on return to home page', () => {
        spyOn(service['router'], 'navigateByUrl');
        socket.peerSideEmit('return to home page');
        expect(service['router'].navigateByUrl).toHaveBeenCalled();
    });
    it('should return false on room swicthed to solo mode ', () => {
        const room: Room = {
            roomId: 0,
            players: [],
            gameType: 0,
        };

        socket.peerSideEmit('room swicthed to solo mode', room);
        expect(service['isRoomJoined']).toBe(false);
    });

    it('should emit a socket on call of switchToSoloMode() ', () => {
        service['room'].roomId = 0;
        service['room'].gameType = 1;
        spyOn(service.socket, 'emit');
        service.switchToSoloMode();
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should not emit a socket switchToSoloMode() if the params are not valid ', () => {
        service['room'].roomId = -1;
        service['room'].gameType = 1;
        spyOn(service.socket, 'emit');
        service.switchToSoloMode();
        expect(service.socket.emit).not.toHaveBeenCalled();
    });

    it('should emit a socket on call of startGame()  ', () => {
        spyOn(service.socket, 'emit');
        service.startGame('tahaz');
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket on call of initializeGameModeMultiPlayer()  ', () => {
        spyOn(service.socket, 'emit');
        const player1Objective: Objective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };

        const player: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '1',
            roomId: 1,
            gameType: 1,
            debugOn: false,
            chatHistory: [],
            privateOvjective: player1Objective,
        };
        service.initializeGameModeMultiPlayer(player, 1);
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket on call of sendMessage()  ', () => {
        spyOn(service.socket, 'emit');
        service.sendMessage('test');
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket on call of joinMultiPlayerGame()  ', () => {
        spyOn(service.socket, 'emit');
        service.joinMultiPlayerGame(1);
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should return the new game on game abandonned', () => {
        const game: LocalGameHandlerService = new LocalGameHandlerService();

        socket.peerSideEmit('game abandonned');
        expect(service.localGame).toEqual(game);
    });

    it('should emit a socket on call of startMultiPlayerGame()  ', () => {
        spyOn(service.socket, 'emit');
        service.startMultiPlayerGame('tahaz');
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket on call of leaveWaitingRoom()  ', () => {
        spyOn(service.socket, 'emit');
        service.leaveWaitingRoom();
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket on call of getAvailableMultiPlayerMatches()  ', () => {
        spyOn(service.socket, 'emit');
        service.getAvailableMultiPlayerMatches();
        jasmine.clock().tick(LONG_TICK);
        expect(service.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket on call of updateTimer()  ', () => {
        spyOn(service.socket, 'emit');
        service.updateTimer();
        jasmine.clock().tick(MEDIUM_TICK);
        expect(service.socket.emit).toHaveBeenCalled();
    });
    it('should call navigateByUrl on call of abandonGame()', () => {
        spyOn(service['router'], 'navigateByUrl');
        service.abandonGame();
        socket.peerSideEmit('return to home page');
        expect(service['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should test the return of getChatObservable() to be defined on call of the methode', () => {
        expect(service.getChatObservable()).toBeDefined();
    });
});
