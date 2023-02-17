/*eslint-disable */
import { ObjectivesService } from '@app/services/objectives-service/objectives.service';
import { Chat, ChatAuthor } from '@common/chat/chat';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { GameModeType, Parameters } from '@common/parameters/parameters';
import { Player } from '@common/player/player';
import { WordOnBoard } from '@common/word-placement/word-placement';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { INDEX_UNDEFINED, TRAY_SIZE } from './../../../../common/constants/constants';
import { LetterTile } from './../../../../common/letter-tile/letter-tile';
import { MatchType } from './../../../../common/match/match';
import { VirtualPlayerDifficulty } from './../../../../common/parameters/parameters';
import { InitializationService } from './../initialization-service/initialization.service';
import { VirtualPlayerService } from './../virtual-player-service/virtual-player.service';
import { GameModeService } from './game-mode.service';

describe('GameModeService', () => {
    let gameModeService: GameModeService;
    let initializationService: InitializationService;
    let virtualPlayerService: VirtualPlayerService;
    let objectiveService: ObjectivesService;
    let parameters: Parameters;
    const playerObjective: Objective = {
        index: 0,
        description: '',
        name: '',
        type: ObjectiveType.Private,
        isReached: false,
        score: 0,
        isPicked: false,
    };
    const player: Player = {
        name: 'ali',
        tray: ['w'],
        score: 0,
        socketId: '20',
        roomId: -1,
        gameType: 0,
        debugOn: false,
        chatHistory: [],
        privateOvjective: playerObjective,
    };
    const playerOpponent: Player = {
        name: 'ali',
        tray: ['w', 'e', 'e', 'd'],
        score: 0,
        socketId: '20',
        roomId: -1,
        gameType: 0,
        debugOn: false,
        chatHistory: [],
        privateOvjective: playerObjective,
    };
    chai.use(spies);

    beforeEach(async () => {
        gameModeService = Container.get(GameModeService);
        initializationService = Container.get(InitializationService);
        virtualPlayerService = Container.get(VirtualPlayerService);
        objectiveService = Container.get(ObjectivesService);
        parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        chai.spy.restore();
    });

    it('should refill trays', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        gameModeService.bank.initializeBank();
        gameModeService.fillTrayTurn();
        expect(gameModeService.match.players[0].tray.length).to.be.equal(TRAY_SIZE);
        expect(gameModeService.match.players[1].tray.length).to.be.equal(TRAY_SIZE);
    });

    it('should initialize game', () => {
        chai.spy.on(initializationService, 'initializeMatch');
        chai.spy.on(initializationService, 'initializeBoard');
        chai.spy.on(gameModeService.bank, 'initializeBank');
        chai.spy.on(gameModeService, 'fillTrayTurn');
        gameModeService.initializeGame(parameters);

        expect(initializationService.initializeMatch).to.have.been.called;
        expect(initializationService.initializeBoard).to.have.been.called;
        expect(gameModeService.bank.initializeBank).to.have.been.called;
        expect(gameModeService.fillTrayTurn).to.have.been.called;
    });

    it('should end game if trays and bank empty', () => {
        gameModeService.match.gameOver = false;
        chai.spy.restore(gameModeService.bank, 'getReserveNumber');
        chai.spy.on(gameModeService.bank, 'getReserveNumber', () => 0);
        gameModeService.match = initializationService.initializeMatch(parameters);
        gameModeService.match.players[0].tray = [];
        gameModeService.match.players[1].tray = [];
        gameModeService.match.players[0].tray.length = 0;
        gameModeService.match.players[1].tray.length = 0;
        gameModeService.bank.bank = new Map<string, LetterTile>();
        // gameModeService.checkEndOfGame();
        expect(gameModeService.checkEndOfGame()).to.be.true;
    });

    it('should end game if 3 consecutive passes and 6 total passes winner is player', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        gameModeService.match.gameOver = false;
        chai.spy.restore(gameModeService.bank, 'getReserveNumber');
        chai.spy.on(gameModeService.bank, 'getReserveNumber', () => 23);
        gameModeService.match.players[1].tray.length = 4;
        gameModeService.match.players[0].tray.length = 6;
        gameModeService.match.numberOfConsecutivePasses = 3;
        gameModeService.match.numberOfTotalPasses = 6;
        gameModeService.checkEndOfGame();
        expect(gameModeService.checkEndOfGame()).to.be.true;
        expect(gameModeService.match.winner).to.equal(1);
    });

    it('should end game if 3 consecutive passes and 6 total passes player', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        gameModeService.match.gameOver = false;
        chai.spy.restore(gameModeService.bank, 'getReserveNumber');
        chai.spy.on(gameModeService.bank, 'getReserveNumber', () => 23);
        gameModeService.match.players[1].tray.length = 4;
        gameModeService.match.players[0].tray.length = 6;
        gameModeService.match.numberOfConsecutivePasses = 3;
        gameModeService.match.numberOfTotalPasses = 6;
        gameModeService.match.players[0].score = 2;
        gameModeService.match.players[1].score = 230;
        gameModeService.checkEndOfGame();
        expect(gameModeService.checkEndOfGame()).to.be.true;
        expect(gameModeService.match.winner).to.equal(1);
    });

    /* it('should end game if 3 consecutive passes and 6 total passes (case: there is winner)', () => {
        gameModeService.match.gameOver = false;
        gameModeService.match = initializationService.initializeMatch();
        gameModeService.match.numberOfConsecutivePasses = 3;
        gameModeService.match.numberOfTotalPasses = 6;
        gameModeService.match.players[0].score = 10;
        gameModeService.match.players[1].score = 1;
        gameModeService.checkEndOfGame();
    });*/

    it('should end game second condition enter in the if', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        gameModeService.match.players[0].score = 1;
        gameModeService.match.players[1].score = 0;
        gameModeService.match.numberOfConsecutivePasses = 4;
        gameModeService.match.numberOfTotalPasses = 8;
        expect(gameModeService.checkEndOfGame()).to.be.true;
        expect(gameModeService.match.winner).to.equal(0);
    });

    /* it('should end game second condition enter in the if', () => {
        gameModeService.match = initializationService.initializeMatch();
        gameModeService.match.players[0].score = 1;
        gameModeService.match.players[1].score = 0;
        gameModeService.match.numberOfConsecutivePasses = 8;
        gameModeService.match.numberOfTotalPasses = 4;
        expect(gameModeService.checkEndOfGame()).to.be.true;
        expect(gameModeService.match.winner).to.equal(1);
    });*/

    it('get Tray Score', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        gameModeService.match.players[0].tray = [];
        expect(gameModeService.getTrayScore(0)).to.be.equal(0);
    });

    it('should get Player Index case the same name', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        const playerName = 'Name';
        gameModeService.match.players[0].name = 'Name';
        expect(gameModeService.getPlayerIndex(playerName)).to.equal(0);
    });

    it('should get Player Index case the name is different ', () => {
        gameModeService.match = initializationService.initializeMatch(parameters);
        const playerName = 'Name1';
        gameModeService.match.players[0].name = 'Name';
        expect(gameModeService.getPlayerIndex(playerName)).to.equal(1);
    });

    it('pickRandomLetters() should return non null string', () => {
        expect(gameModeService.pickRandomLetters(3)).to.not.be.undefined;
    });

    it('should return suffixMaxLength', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 12,
            word: 'de',
        };
        gameModeService.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameModeService.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        expect(gameModeService.findSuffixMaxLength(0, wordOnBoard)).to.equal(1);
    });

    it('should return startPosition', () => {
        gameModeService.board[0][0].letter = 'd';
        gameModeService.board[0][1].letter = 'e';
        expect(gameModeService.findPrefixMaxLength(0, 0)).to.equal(0);
    });

    it('should return prefixMaxLength', () => {
        gameModeService.board[2][2].letter = 'd';
        gameModeService.board[2][3].letter = 'e';
        expect(gameModeService.findPrefixMaxLength(2, 2)).to.equal(2);
    });

    it('should call findPrefixMaxLength() and findSuffixMaxLength on call of getPotentialWordsFromDictionary  ', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 12,
            word: 'de',
        };
        gameModeService.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameModeService.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        chai.spy.on(gameModeService, 'findPrefixMaxLength');
        chai.spy.on(gameModeService, 'findSuffixMaxLength');
        virtualPlayerService.getPotentialWordsFromDictionary(0, wordOnBoard);
        expect(gameModeService.findPrefixMaxLength).to.have.been.called;
        expect(gameModeService.findSuffixMaxLength).to.have.been.called;
    });

    it('getIndexOfCurrentPlayer() should return correct index', () => {
        expect(gameModeService.getIndexOfCurrentPlayer(player)).to.equal(INDEX_UNDEFINED);
    });

    it('getIndexOfCurrentPlayer() should return correct index', () => {
        gameModeService.match.players = [player, playerOpponent];
        expect(gameModeService.getIndexOfCurrentPlayer(player)).to.equal(0);
    });

    it('updateMatchForAbandonGame() should call initializeVirtualPlayer()', () => {
        chai.spy.on(initializationService, 'initializeVirtualPlayer');
        gameModeService.updateMatchForAbandonGame(player, playerOpponent, VirtualPlayerDifficulty.Beginner);
        expect(initializationService.initializeVirtualPlayer).to.be.called;
    });

    it('setCreatorPlayerInfo() should update player0 info', () => {
        gameModeService.setCreatorPlayerInfo(player, 2, '1');
        expect(gameModeService.match.players[0].name).to.equal('ali');
    });

    it('setObjectives() should call initializeObjectives() (case: no random boxes)', () => {
        chai.spy.on(initializationService, 'initializeObjectives');
        objectiveService.initializeObjectives();
        gameModeService.setObjectives(false);
        expect(initializationService.initializeObjectives).to.be.called;
    });

    it('setObjectives() should call initializeObjectives() (case: yes random boxes)', () => {
        chai.spy.on(initializationService,'initializeObjectives');
        objectiveService.initializeObjectives();
        parameters.isBoxTypeRandom = true;
        gameModeService.setObjectives(true);
        expect(initializationService.initializeObjectives).to.be.called;
    });

    it('setSoloModePlayerInfo() should update player0 info', () => {
        gameModeService.setSoloModePlayerInfo(player, 2);
        expect(gameModeService.match.players[0].name).to.equal('ali');
    });

    it('initializeMultiPlayerModeMatch() should set match type', () => {
        gameModeService.initializeMultiPlayerModeMatch(player);
        expect(gameModeService.match.type).to.equal(1);
    });

    it('updateChatHistory() should push into chat history', () => {
        gameModeService.match.type = MatchType.Solo;
        const chat: Chat = {
            message: 'blah',
            author: ChatAuthor.Player,
        };
        gameModeService.updateChatHistory(chat, 0);
        expect(gameModeService.match.players[0].chatHistory).to.not.be.undefined;
    });

    it('updateChatHistory() should push into chat history', () => {
        gameModeService.match.type = MatchType.Multiplayer;
        const chat: Chat = {
            message: 'blah',
            author: ChatAuthor.Player,
        };
        gameModeService.updateChatHistory(chat, 0);
        expect(gameModeService.match.players[0].chatHistory).to.not.be.undefined;
    });

    it('updateChatHistoryForAllParticipants() should push into chat history', () => {
        gameModeService.match.type = MatchType.Multiplayer;
        const chat: Chat = {
            message: 'blah',
            author: ChatAuthor.Player,
        };
        gameModeService.updateChatHistoryForAllParticipants(chat);
        expect(gameModeService.match.players[1].chatHistory).to.not.be.undefined;
    });
});
