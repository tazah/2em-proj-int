/*eslint-disable */
import { Room } from '@app/classes/room/room';
import { Chat, ChatAuthor } from '@common/chat/chat';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { Player } from '@common/player/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as Sinon from 'sinon';
import { Socket } from 'socket.io';
import * as ioClient from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Container } from 'typedi';
import { DatabaseService } from '../database-services/database-service/database.service';
import { DatabaseServiceMock } from '../database-services/database-service/database.service.mock';
import { Server } from './../../server';
import { SocketManager } from './socket-manager.service';
class SocketMock extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {
    id: string;
}
describe('SocketManager', () => {
    let socketManagerService: SocketManager;
    let clientSocket: ioClient.Socket;
    let player: Player;
    let playerObjective: Objective;
    let serverSocket: SocketMock;
    let parameters: Parameters;
    const databaseService: DatabaseServiceMock = new DatabaseServiceMock();

    chai.use(spies);

    before(() => {
        playerObjective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };

        player = {
            tray: [],
            name: 'Karim',
            score: 0,
            socketId: '5',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: playerObjective,
        };

        parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
    });

    beforeEach((done) => {
        const server: Server = Container.get(Server);
        player = {
            tray: [],
            name: 'Karim',
            score: 0,
            socketId: '5',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: playerObjective,
        };
        server.init().then(() => {
            socketManagerService = server.socketManger;
            socketManagerService['sio'].on('connection', (socket) => {
                serverSocket = socket;
                serverSocket.id = player.socketId;
            });
            clientSocket = ioClient.io('http://localhost:3000');
            clientSocket.on('connect', () => {});
            done();
        });
    });

    afterEach(() => {
        const server: Server = Container.get(Server);
        server['server'].close();
        chai.spy.restore();
    });

    after(() => {
        clientSocket.close();
    });

    it('socketManagerService.startGame should start Mode Solo Game and start game timer', (done) => {
        chai.spy.on(socketManagerService, 'startGame');
        clientSocket.emit('startModeSoloGame');

        setTimeout(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.timerService, 'launchTimer');
            chai.spy.on(room.gameManager.dictionnaryService, 'loadDictionaryFromAssets');
            chai.spy.on(room.gameManager.initializationService, 'getVirtualPlayerNames');
            chai.spy.on(room.gameManager.gameModeService, 'setCreatorPlayerInfo');
            chai.spy.on(room.gameManager.gameModeService, 'setObjectives');
            chai.spy.on(room.gameManager.gameModeService, 'setSoloModePlayerInfo');

            expect(socketManagerService.startGame).to.have.been.called;
            expect(room.gameManager.timerService.launchTimer).to.have.been.called;
            expect(room.gameManager.dictionnaryService.loadDictionaryFromAssets).to.have.been.called;
            expect(room.gameManager.initializationService.getVirtualPlayerNames).to.have.been.called;
            expect(room.gameManager.gameModeService.setCreatorPlayerInfo).to.have.been.called;
            expect(room.gameManager.gameModeService.setSoloModePlayerInfo).to.have.been.called;

            done();
        }, 200);
    });

    it('socketManagerService.startGame should not start game and should return if player is undefined', (done) => {
        chai.spy.on(socketManagerService, 'startGame');
        chai.spy.on(socketManagerService['playerManager'], 'getPlayerFromSocketID', () => undefined);
        chai.spy.on(socketManagerService['playerManager'], 'addPlayer', () => undefined);
        const stubOn = Sinon.stub(socketManagerService['playerManager'], 'addPlayer').returns(undefined as unknown as Player);
        clientSocket.emit('startModeSoloGame');
        setTimeout(() => {
            socketManagerService['playerManager'].players = [];
        }, 100);
        setTimeout(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.timerService, 'launchTimer');

            expect(socketManagerService.startGame).to.have.been.called;
            expect(room.gameManager.timerService.launchTimer).to.not.have.been.called;
            expect(stubOn).to.have.been.called;

            done();
        }, 100);
    });

    it('socketManagerService.handleCommand should treat command if its a player turn', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');
        chai.spy.on(socketManagerService['sio'], 'emit');
        // chai.spy.on(socketManagerService['playerManager'],'getPlayerFromSocketID',()=>undefined);

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.commandService, 'handleCommand');
            room.gameManager.gameModeService.match.activePlayer = 0;
            setTimeout(() => {
                clientSocket.emit('treat command', player, '!placer h8h abc');
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.handleCommand).to.have.been.called;
                expect(room.gameManager.commandService.handleCommand).to.have.been.called;
                expect(socketManagerService['sio'].emit).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.handleCommand should treat command if its a player turn and its a singular command', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');
        chai.spy.on(socketManagerService['sio'], 'emit');

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.commandService, 'handleCommand');
            room.gameManager.gameModeService.match.activePlayer = 0;
            setTimeout(() => {
                clientSocket.emit('treat command', player, '!debug');
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.handleCommand).to.have.been.called;
                expect(room.gameManager.commandService.handleCommand).to.have.been.called;
                expect(socketManagerService['sio'].emit).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.handleCommand should treat command if its a player turn and its a singular command', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');
        chai.spy.on(socketManagerService['sio'], 'emit');

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            const temporaryCommand: Chat = {
                message: 'Commande Impossible effacer apres 3 secondes',
                author: ChatAuthor.Player,
            };
            chai.spy.on(room.gameManager.commandService, 'handleCommand', () => temporaryCommand);
            room.gameManager.gameModeService.match.activePlayer = 0;
            setTimeout(() => {
                clientSocket.emit('treat command', player, '!placer h8h xyz');
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.handleCommand).to.have.been.called;
                expect(room.gameManager.commandService.handleCommand).to.have.been.called;
                expect(socketManagerService['sio'].emit).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.handleCommand should treat command if its not virtual player turn', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.commandService, 'handleCommand');
            room.gameManager.gameModeService.match.activePlayer = 1;
            setTimeout(() => {
                clientSocket.emit('treat command', player, '!placer h8h abc');
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.handleCommand).to.have.been.called;
                expect(room.gameManager.commandService.handleCommand).to.have.been.called;
                // expect(socketManagerService['sio'].emit);
                done();
            }, 200);
        });
    });

    it('socketManagerService.handleCommand should treat command if its a player turn', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');
        chai.spy.on(socketManagerService['sio'], 'emit');
        // chai.spy.on(socketManagerService['playerManager'],'getPlayerFromSocketID',()=>undefined);

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.commandService, 'handleCommand');
            room.gameManager.gameModeService.match.activePlayer = 0;
            setTimeout(() => {
                clientSocket.emit('treat command', player, '!placer h8h abc');
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.handleCommand).to.have.been.called;
                expect(room.gameManager.commandService.handleCommand).to.have.been.called;
                expect(socketManagerService['sio'].emit).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.handleCommand should not handleCommand if player is undefined', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.commandService, 'handleCommand');
            socketManagerService['playerManager'].players = [];
            clientSocket.emit('treat command', undefined, '!debug');
            setTimeout(() => {
                expect(room.gameManager.commandService.handleCommand).to.not.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.handleCommand should not handleCommand if room is undefined', (done) => {
        chai.spy.on(socketManagerService, 'handleCommand');

        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.commandService, 'handleCommand');
            socketManagerService['roomManager'].rooms = [];
            clientSocket.emit('treat command', undefined, '!debug');
            setTimeout(() => {
                expect(room.gameManager.commandService.handleCommand).to.not.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.disconnectPlayer should disconnect player in solo game', (done) => {
        chai.spy.on(socketManagerService, 'disconnectPlayer');
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            setTimeout(() => {
                clientSocket.disconnect();
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.disconnectPlayer).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.disconnectPlayer should disconnect player in multiplayer game', (done) => {
        chai.spy.on(socketManagerService, 'disconnectPlayer');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService.initializeMultiPlayerGame(serverSocket, player, 0);
            setTimeout(() => {
                clientSocket.disconnect();
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.disconnectPlayer).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.disconnectPlayer should return when trying to disconnect if game is already over', (done) => {
        chai.spy.on(socketManagerService, 'disconnectPlayer');
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            room.gameManager.gameModeService.match.gameOver = true;
            socketManagerService['playerManager'].players = [];
            setTimeout(() => {
                clientSocket.disconnect();
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.disconnectPlayer).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.disconnectPlayer should return when player trying to disconnect is already removed', (done) => {
        chai.spy.on(socketManagerService, 'disconnectPlayer');
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            const room = socketManagerService['roomManager'].findRoom(0);
            room.gameManager.gameModeService.match.gameOver = true;

            setTimeout(() => {
                clientSocket.disconnect();
            }, 100);
            setTimeout(() => {
                expect(socketManagerService.disconnectPlayer).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.updateTimer should update timer', (done) => {
        chai.spy.on(socketManagerService, 'updateTimer');
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('updateTimer');
            setTimeout(() => {
                expect(socketManagerService.updateTimer).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.updateTimer should not update timer if player is undefined', (done) => {
        chai.spy.on(socketManagerService, 'updateTimer');
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService['playerManager'].players = [];
            clientSocket.emit('updateTimer');
            setTimeout(() => {
                expect(socketManagerService['updateTimer']).to.not.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.updateTimer should not update timer if room is undefined', (done) => {
        chai.spy.on(socketManagerService, 'updateTimer');
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService['roomManager'].rooms = [];
            clientSocket.emit('updateTimer');
            setTimeout(() => {
                expect(socketManagerService['updateTimer']).to.not.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.updateGame should update turn in solo game', (done) => {
        chai.spy.on(socketManagerService, 'updateGame');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('update turn');
            setTimeout(() => {
                expect(socketManagerService.updateGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.updateGame should update turn in multiplayer game', (done) => {
        chai.spy.on(socketManagerService, 'updateGame');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService.initializeMultiPlayerGame(serverSocket, player, 0);
            clientSocket.emit('update turn');
            setTimeout(() => {
                expect(socketManagerService.updateGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.updateGame should not update turn if room is undefined', (done) => {
        chai.spy.on(socketManagerService, 'updateGame');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService['roomManager'].rooms = [];
            clientSocket.emit('update turn');
            setTimeout(() => {
                expect(socketManagerService.updateGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.startMultiPlayerGame should start multiplayer game', (done) => {
        chai.spy.on(socketManagerService, 'startMultiPlayerGame');

        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        clientSocket.emit('startModeMultiPlayerGame', false, 60);
        let room: Room = new Room(0, 1, databaseService as unknown as DatabaseService);
        setTimeout(() => {
            room = socketManagerService['roomManager'].findRoom(0);
            chai.spy.on(room.gameManager.dictionnaryService, 'loadDictionaryFromAssets');
            chai.spy.on(room.gameManager.initializationService, 'getVirtualPlayerNames');
            chai.spy.on(room.gameManager.gameModeService, 'setCreatorPlayerInfo');
        }, 100);
        setTimeout(() => {
            expect(socketManagerService.startMultiPlayerGame).to.have.been.called;
            expect(room.gameManager.dictionnaryService.loadDictionaryFromAssets).to.have.been.called;
            expect(room.gameManager.initializationService.getVirtualPlayerNames).to.have.been.called;
            expect(room.gameManager.gameModeService.setCreatorPlayerInfo).to.have.been.called;
            done();
        }, 200);
    });

    it('socketManagerService.leaveWaitingRoom should leave waiting room', (done) => {
        chai.spy.on(socketManagerService, 'leaveWaitingRoom');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('leave waiting room');
            setTimeout(() => {
                expect(socketManagerService.leaveWaitingRoom).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.initializeMultiPlayerGame should initialize mode multiplayer game', (done) => {
        chai.spy.on(socketManagerService, 'initializeMultiPlayerGame');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('initialize Mode MultiPlayer Game', player, 0);
            setTimeout(() => {
                expect(socketManagerService.initializeMultiPlayerGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.joinAMultiPlayerGame should join a multiplayer game', (done) => {
        chai.spy.on(socketManagerService, 'joinAMultiPlayerGame');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('join a multiPlayerGame', 0);
            setTimeout(() => {
                expect(socketManagerService.joinAMultiPlayerGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.switchToSoloGame should switch to solo game', (done) => {
        chai.spy.on(socketManagerService, 'switchToSoloGame');
        socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('switch to solo game', 0, false);
            setTimeout(() => {
                expect(socketManagerService.switchToSoloGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.abandonGame should abandon solo game', (done) => {
        chai.spy.on(socketManagerService, 'abandonGame');
        chai.spy.on(socketManagerService['playerManager'], 'getPlayerFromSocketID', () => {
            return player;
        });
        const room = socketManagerService.roomManager.addRoom(0, databaseService as unknown as DatabaseService);
        player.roomId = room.roomID;
        socketManagerService['playerManager'].players.push(player);
        room.gameManager.gameModeService.match.gameOver = true;
        chai.spy.on(socketManagerService['roomManager'], 'findRoom', () => room);
        socketManagerService.startGame(serverSocket, 'Karim', parameters).then(() => {
            clientSocket.emit('abandon game');
            setTimeout(() => {
                expect(socketManagerService.abandonGame).to.have.been.called;
                done();
            }, 100);
        });
    });

    it('socketManagerService.abandonGame should abandon multiplayer game', (done) => {
        chai.spy.on(socketManagerService, 'abandonGame');
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService.initializeMultiPlayerGame(serverSocket, player, 0);
                clientSocket.emit('abandon game');
            setTimeout(() => {
                expect(socketManagerService.abandonGame).to.have.been.called;
                done();
            }, 200);
        });
    });

    it('socketManagerService.findAvailableMatches should find available matches', (done) => {
        chai.spy.on(socketManagerService, 'findAvailableMatches');
        chai.spy.on(serverSocket, 'emit');
        socketManagerService.startMultiPlayerGame(serverSocket, 'Karim', parameters).then(() => {
            socketManagerService['playerManager'].addPlayer(player.name, player.socketId);
            const room2 = socketManagerService['roomManager'].addRoom(1, databaseService as unknown as DatabaseService);
            room2.gameManager.gameModeService.match.mode = GameModeType.classic;
            room2.gameManager.gameInfo.isGameStarted = false;
            const room = socketManagerService['roomManager'].findRoom(0);
            room.players.push(player);
            room.players.push(player);
            room.players.length = 5;
            clientSocket.emit('available Matches', GameModeType.classic);
            setTimeout(() => {
                expect(socketManagerService.findAvailableMatches).to.have.been.called;
                expect(serverSocket.emit);
                done();
            }, 100);
        });
    });

    it('socketManagerService.reconnectPlayer should reconnect and send him to home page', (done) => {
        chai.spy.on(socketManagerService, 'reconnectPlayer');
        chai.spy.on(serverSocket, 'emit');
        socketManagerService.abandonGame(serverSocket);
        clientSocket.emit('reconnect');
        setTimeout(() => {
            expect(socketManagerService.reconnectPlayer).to.have.been.called;
            expect(serverSocket.emit);
            done();
        }, 100);
    });

    it('socketManagerService.reconnectPlayer should reconnect client by send sending him to home page if his connection is timedOut', (done) => {
        chai.spy.on(socketManagerService, 'reconnectPlayer');
        chai.spy.on(serverSocket, 'emit');
        socketManagerService.abandonGame(serverSocket);
        clientSocket.emit('reconnect');
        setTimeout(() => {
            expect(socketManagerService.reconnectPlayer).to.have.been.called;
            expect(serverSocket.emit);
            done();
        }, 100);
    });

    it('socketManagerService.reconnectPlayer should reconnect client by clearing his timeOut if his connection is not timedOut yet', (done) => {
        chai.spy.on(socketManagerService, 'reconnectPlayer');
        chai.spy.on(socketManagerService['connectedSockets'], 'has', () => true);
        socketManagerService.abandonGame(serverSocket);
        clientSocket.emit('reconnect');
        setTimeout(() => {
            expect(socketManagerService.reconnectPlayer).to.have.been.called;
            expect(socketManagerService['connectedSockets'].has).to.have.been.called;
            done();
        }, 100);
    });
});
