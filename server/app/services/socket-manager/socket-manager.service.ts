import { GameType } from '@app/classes/game-info/game-info';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { Box } from './../../../../common/box/box';
import { Chat, ChatAuthor } from './../../../../common/chat/chat';
import { FIVE_SECONDS, INDEX_NOT_FOUND, THREE_SECONDS } from './../../../../common/constants/constants';
import { LetterTile } from './../../../../common/letter-tile/letter-tile';
import { MatchListElement } from './../../../../common/match-list-element/match-list-element';
import { Match, MatchType } from './../../../../common/match/match';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from './../../../../common/parameters/parameters';
import { Player } from './../../../../common/player/player';
import { Room } from './../../classes/room/room';
import { DatabaseService } from './../database-services/database-service/database.service';
import { PlayerManager } from './../player-manager/player-manager.service';
import { RoomManager } from './../room-manager/room-manager.service';
@Service()
export class SocketManager {
    roomManager: RoomManager;
    private sio: io.Server;
    private playerManager: PlayerManager;
    private connectedSockets: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();
    private dataBase: DatabaseService;

    constructor(httpServer: http.Server, dataBaseService: DatabaseService) {
        this.sio = new io.Server(httpServer, { cors: { origin: '*' } });
        this.playerManager = new PlayerManager();
        this.roomManager = new RoomManager();
        this.dataBase = dataBaseService;
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.on('startModeSoloGame', (name: string, initialParameters: Parameters) => {
                this.startGame(socket, name, initialParameters);
            });
            socket.on('initialize Mode MultiPlayer Game', (player: Player, roomId: number) => {
                this.initializeMultiPlayerGame(socket, player, roomId);
            });
            socket.on('treat command', (player: Player, submessage: string) => {
                this.handleCommand(socket, player, submessage);
            });
            socket.on('startModeMultiPlayerGame', (name: string, initialParameters: Parameters) => {
                this.startMultiPlayerGame(socket, name, initialParameters);
            });
            socket.on('available Matches', (mode: GameModeType) => {
                this.findAvailableMatches(socket, mode);
            });
            socket.on('join a multiPlayerGame', (roomId: number) => {
                this.joinAMultiPlayerGame(socket, roomId);
            });
            socket.on('updateTimer', () => {
                const player = this.playerManager.getPlayerFromSocketID(socket.id);
                if (player === undefined || player.roomId === INDEX_NOT_FOUND) return;
                const room: Room = this.roomManager.findRoom(player.roomId);
                if (room !== undefined) this.updateTimer(socket, room);
            });
            socket.on('disconnect', () => {
                this.disconnectPlayer(socket);
            });
            socket.on('reconnect', () => {
                this.reconnectPlayer(socket);
            });
            socket.on('abandon game', () => {
                this.abandonGame(socket);
            });
            socket.on('leave waiting room', () => {
                this.leaveWaitingRoom(socket);
            });
            socket.on('switch to solo game', (room: Room, difficulty: VirtualPlayerDifficulty) => {
                this.switchToSoloGame(socket, difficulty);
            });
            socket.on('update turn', () => {
                this.updateGame(socket);
            });
        });
    }

    abandonGame(socket: io.Socket): void {
        const leavingPlayer = this.playerManager.getPlayerFromSocketID(socket.id);
        if (leavingPlayer === undefined) return;
        const room: Room = this.roomManager.findRoom(leavingPlayer.roomId);
        socket.leave(room.roomID.toString());
        if (room.gameManager.gameModeService.match.type === MatchType.Multiplayer) {
            room.gameManager.gameModeService.match.type = MatchType.Solo;
            room.gameManager.gameInfo.gameType = GameType.Solo;

            const opponentIndex = 1 - room.gameManager.gameModeService.getIndexOfCurrentPlayer(leavingPlayer);
            const opponentPlayer = room.gameManager.gameModeService.match.players[opponentIndex];
            opponentPlayer.gameType = 0;
            room.gameManager.gameModeService.updateMatchForAbandonGame(
                opponentPlayer,
                leavingPlayer,
                room.gameManager.gameModeService.match.parameters.difficulty,
            );
            room.gameManager.chatBoxService.chatHistory.push({
                author: ChatAuthor.System,
                message: 'votre adversaire a abandonne la partie, il est remplace par un joueur virtuel débutant, bonne chance!',
            });

            this.updateGame(socket);
        }
        leavingPlayer.roomId = -1;
        this.playerManager.players[this.playerManager.players.indexOf(leavingPlayer)].roomId = -1;
    }

    leaveWaitingRoom(socket: io.Socket): void {
        const player = this.playerManager.getPlayerFromSocketID(socket.id);
        const room = this.roomManager.findRoom(player.roomId);
        room.gameManager.gameInfo.isGameStarted = false;
    }

    switchToSoloGame(socket: io.Socket, difficulty: VirtualPlayerDifficulty): void {
        const player = this.playerManager.getPlayerFromSocketID(socket.id);
        const roomToSwitch: Room = this.roomManager.findRoom(player.roomId);
        roomToSwitch.roomType = 0;
        roomToSwitch.gameManager.gameModeService.match.parameters.difficulty = difficulty;
        roomToSwitch.gameManager.gameInfo.gameType = GameType.Solo;
        roomToSwitch.gameManager.gameModeService.match.players[0].gameType = 0;
        roomToSwitch.gameManager.gameModeService.fillTrayTurn();
        socket.join(roomToSwitch.roomID.toString());
        const match: Match = roomToSwitch.gameManager.gameModeService.match;
        const bank: Map<string, LetterTile> = roomToSwitch.gameManager.gameModeService.bank.bank;
        const board: Box[][] = roomToSwitch.gameManager.gameModeService.board;
        roomToSwitch.gameManager.timerService.launchTimer();
        socket.in(roomToSwitch.roomID.toString()).emit('joinModeSolo', roomToSwitch.roomID);
        socket.emit('Game Initialized', match, JSON.stringify(Array.from(bank)), board);
    }

    updateTimer(socket: io.Socket, room: Room): void {
        socket
            .in(room.roomID.toString())
            .emit('timer updated', room.gameManager.gameModeService.match.parameters.timer, room.gameManager.gameModeService.match);
        this.sio
            .to(socket.id)
            .emit(
                'timer updated',
                room.gameManager.gameModeService.match.parameters.timer,
                room.gameManager.gameModeService.match.activePlayer,
                room.gameManager.gameModeService.match,
            );
    }

    joinAMultiPlayerGame(socket: io.Socket, roomId: number): void {
        const room: Room = this.roomManager.findRoom(roomId);
        if (room === undefined) return;
        room.gameManager.gameInfo.isGameStarted = true;
        socket.emit(
            'join second player',
            room.gameManager.gameModeService.match,
            JSON.stringify(Array.from(room.gameManager.bankService.bank)),
            room.gameManager.gameModeService.board,
        );
    }

    findAvailableMatches(socket: io.Socket, mode: GameModeType): Room[] {
        let availableRooms: Room[] = new Array<Room>();
        availableRooms = this.roomManager.rooms.filter(
            (aRoom) =>
                aRoom.roomType === 1 &&
                !aRoom.gameManager.gameInfo.isGameStarted &&
                aRoom.gameManager.gameModeService.match.parameters.mode === mode &&
                aRoom.players.length > 0,
        );
        const outPutMessages: MatchListElement[] = new Array<MatchListElement>();
        availableRooms.forEach((availableRoom) => {
            outPutMessages.push({
                roomId: availableRoom.roomID,
                creatorName: availableRoom.players[0].name,
                timerUsed: availableRoom.gameManager.gameModeService.match.parameters.timer,
                dictionaryUsed: availableRoom.gameManager.gameModeService.match.parameters.dictionary,
                isRandomModeOn: availableRoom.gameManager.gameModeService.isBoxTypeRandom,
            });
        });
        socket.emit('collect available rooms', outPutMessages);
        return availableRooms;
    }

    async startMultiPlayerGame(socket: io.Socket, playerName: string, initialParameters: Parameters) {
        const player = this.playerManager.addPlayer(playerName, socket.id);
        const room: Room = this.roomManager.addRoom(1, this.dataBase);
        player.roomId = room.roomID;
        room.gameManager.gameModeService.match.parameters = initialParameters;
        room.gameManager.dictionnaryService.loadDictionaryFromAssets(room.gameManager.gameModeService.match.parameters.dictionary);
        await room.gameManager.initializationService.getVirtualPlayerNames();
        room.gameManager.gameModeService.initializeGame(initialParameters);
        room.gameManager.gameInfo.gameType = GameType.Multiplayer;
        const creatorPlayer: Player = this.playerManager.getPlayerFromSocketID(socket.id);
        creatorPlayer.roomId = room.roomID;
        creatorPlayer.gameType = 1;
        room.gameManager.gameModeService.isBoxTypeRandom = initialParameters.isBoxTypeRandom;
        room.players = [];
        room.players.push(creatorPlayer);
        room.gameManager.gameModeService.setCreatorPlayerInfo(creatorPlayer, room.roomID, player.socketId);
        socket.join(room.roomID.toString());
        socket.emit('joinModeMultiPlayer', room.roomID);
    }

    handleCommand(socket: io.Socket, player: Player, message: string) {
        const playerCommand = this.playerManager.getPlayerFromSocketID(socket.id);
        player = playerCommand;
        if (player === undefined) return;
        const room: Room = this.roomManager.findRoom(playerCommand.roomId);
        if (room === undefined) return;
        const commandOutput: Chat = room.gameManager.commandService.handleCommand(message, player);
        const isVirtualPlayerTurn: boolean =
            room.gameManager.gameModeService.match.type === MatchType.Solo && room.gameManager.gameModeService.match.activePlayer === 1;
        if (isVirtualPlayerTurn) commandOutput.author = ChatAuthor.Player;

        const isCommandTemporary: boolean = commandOutput.message.includes('Commande Impossible effacer apres 3 secondes');

        if (isCommandTemporary) {
            commandOutput.message = 'Commande Impossible';
            setTimeout(() => {
                this.sio
                    .to(socket.id)
                    .emit(
                        'game updated',
                        room.gameManager.gameModeService.match,
                        JSON.stringify(Array.from(room.gameManager.bankService.bank)),
                        room.gameManager.gameModeService.board,
                    );
            }, THREE_SECONDS);
        }

        const isOutCommandSingular: boolean = room.gameManager.commandService.isSingularCommand(message);
        const isErrorMessageSingular: boolean = room.gameManager.commandService.isSingularOutput(commandOutput.message);

        if (isOutCommandSingular || isErrorMessageSingular) {
            room.gameManager.gameModeService.updateChatHistory(commandOutput, room.players.indexOf(player));
            this.sio
                .to(socket.id)
                .emit(
                    'update chatBoxHistory',
                    room.gameManager.gameModeService.match.players,
                    room.gameManager.gameModeService.match.activePlayer,
                    isCommandTemporary,
                );
        } else {
            room.gameManager.gameModeService.updateChatHistoryForAllParticipants(commandOutput);
            this.sio
                .in(playerCommand.roomId.toString())
                .emit(
                    'update chatBoxHistory',
                    room.gameManager.gameModeService.match.players,
                    room.gameManager.gameModeService.match.activePlayer,
                    isCommandTemporary,
                );
            this.updateGame(socket);
        }
    }

    updateGame(socket: io.Socket): void {
        const playerCommand = this.playerManager.getPlayerFromSocketID(socket.id);
        const room: Room = this.roomManager.findRoom(playerCommand.roomId);
        if (room === undefined) return;
        if (room.gameManager.gameInfo.gameType === GameType.Solo) {
            room.gameManager.gameModeService.match.players[0].chatHistory = room.gameManager.chatBoxService.chatHistory;
        }
        this.sio
            .in(room.roomID.toString())
            .emit(
                'game updated',
                room.gameManager.gameModeService.match,
                JSON.stringify(Array.from(room.gameManager.bankService.bank)),
                room.gameManager.gameModeService.board,
            );
    }

    async startGame(socket: io.Socket, playerName: string, initialParameters: Parameters) {
        const player = this.playerManager.addPlayer(playerName, socket.id);
        const room: Room = this.roomManager.addRoom(0, this.dataBase);
        room.gameManager.gameModeService.match.parameters = initialParameters;
        room.gameManager.gameInfo.gameType = GameType.Solo;
        room.gameManager.dictionnaryService.loadDictionaryFromAssets(room.gameManager.gameModeService.match.parameters.dictionary);
        await room.gameManager.initializationService.getVirtualPlayerNames();
        room.gameManager.gameModeService.initializeGame(initialParameters);
        const joinPlayer: Player = this.playerManager.getPlayerFromSocketID(socket.id);
        if (joinPlayer === undefined) return;
        joinPlayer.roomId = room.roomID;
        room.gameManager.gameModeService.setObjectives(initialParameters.isBoxTypeRandom);
        room.players.push(joinPlayer);
        room.gameManager.gameModeService.setSoloModePlayerInfo(player, room.roomID);
        room.gameManager.virtualPlayerService.player = room.gameManager.gameModeService.match.players[1];
        socket.join(room.roomID.toString());
        const match: Match = room.gameManager.gameModeService.match;
        const bank: Map<string, LetterTile> = room.gameManager.gameModeService.bank.bank;
        const board: Box[][] = room.gameManager.gameModeService.board;
        room.gameManager.timerService.launchTimer();
        socket.in(room.roomID.toString()).emit('joinModeSolo', room.roomID);
        socket.emit('Game Initialized', match, JSON.stringify(Array.from(bank)), board);
    }

    initializeMultiPlayerGame(socket: io.Socket, secondPlayer: Player, roomId: number): void {
        secondPlayer.socketId = socket.id;
        const player = this.playerManager.addPlayer(secondPlayer.name, socket.id);
        const room: Room = this.roomManager.findRoom(roomId);
        room.gameManager.gameInfo.isGameStarted = true;
        player.roomId = room.roomID;
        player.gameType = 1;
        secondPlayer.socketId = player.socketId;
        socket.join(room.roomID.toString());
        room.players.push(player);
        room.gameManager.gameModeService.initializeMultiPlayerModeMatch(player);
        room.gameManager.timerService.launchTimer();
        socket.in(roomId.toString()).emit('GoToGamePage');
        this.sio
            .in(room.roomID.toString())
            .emit(
                'game updated',
                room.gameManager.gameModeService.match,
                JSON.stringify(Array.from(room.gameManager.bankService.bank)),
                room.gameManager.gameModeService.board,
            );
    }

    disconnectPlayer(socket: io.Socket): void {
        const leavingPlayer = this.playerManager.getPlayerFromSocketID(socket.id);
        if (leavingPlayer === undefined || leavingPlayer.roomId === INDEX_NOT_FOUND) return;
        const timeoutId = setTimeout(() => {
            const room: Room = this.roomManager.findRoom(leavingPlayer.roomId);
            if (room.gameManager.gameModeService.match.gameOver) {
                this.sio.socketsLeave(room.roomID.toString());
                this.playerManager.players[this.playerManager.players.indexOf(leavingPlayer)].roomId = -1;
                return;
            }
            room.gameManager.gameModeService.match.gameOver = true;
            const opponentIndex = 1 - room.gameManager.gameModeService.getIndexOfCurrentPlayer(leavingPlayer);
            room.gameManager.gameModeService.match.winner = opponentIndex;
            if (room.gameManager.gameModeService.match.type === MatchType.Multiplayer) {
                const opponentPlayer = room.gameManager.gameModeService.match.players[opponentIndex];
                this.sio.to(opponentPlayer.socketId).emit('you have won', room.gameManager.gameModeService.match);
            }
            this.connectedSockets.delete(socket.id);
        }, FIVE_SECONDS);
        this.connectedSockets.set(socket.id, timeoutId);
    }

    reconnectPlayer(socket: io.Socket): void {
        if (this.connectedSockets.has(socket.id)) {
            const timeOutId = this.connectedSockets.get(socket.id) as NodeJS.Timeout;
            clearTimeout(timeOutId);
        } else {
            socket.emit('return to home page');
        }
    }
}
