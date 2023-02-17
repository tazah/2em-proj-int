/*eslint-disable */
import { ChatBoxService } from '@app/services/chat-box-service/chat-box.service';
import { CommandService } from '@app/services/command-service/command.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { ScoreService } from '@app/services/score-service/score.service';
import { ValidationService } from '@app/services/validation-service/validation.service';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { PotentialWord } from '@common/potential-word/potential-word';
import { WordOnBoard } from '@common/word-placement/word-placement';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import {
    NUMBER_OF_COMMAND_ACTION,
    ONE_SECOND_IN_MILLISECONDS,
    TEST_PROBABILITY_I,
    TEST_PROBABILITY_II,
    THREE_SECONDS,
} from './../../../../common/constants/constants';
import { DebugService } from './../debug-service/debug.service';
import { VirtualPlayerService } from './virtual-player.service';
import Sinon = require('sinon');

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;
    let gameMode: GameModeService;
    let validationService: ValidationService;
    let scoreService: ScoreService;
    let commandService: CommandService;
    let chatBoxService: ChatBoxService;
    let parameters: Parameters;
    let debugService: DebugService;

    chai.use(spies);

    beforeEach(() => {
        service = Container.get(VirtualPlayerService);
        gameMode = Container.get(GameModeService);
        validationService = service['validationService'];
        debugService = service['debugService'];
        chatBoxService = service['chatBoxService'];
        commandService = service['commandService'];
        scoreService = service['validationService']['scoreService'];
        parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };

        gameMode.initializeGame(parameters);

        gameMode.match.players[1].tray.push('a');
        gameMode.match.players[1].tray.push('d');
        gameMode.match.players[1].tray.push('e');
        gameMode.match.players[1].tray.push('c');
        gameMode.match.players[1].tray.push('e');
        gameMode.match.players[1].tray.push('f');
        gameMode.match.players[1].tray.push('n');
        service.tray = gameMode.match.players[1].tray;
    });

    beforeEach(() => {
        chai.spy.restore();
        Sinon.restore();
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(VirtualPlayerService);
    });

    it('getPotentialWordsFromDictionary should call findPrefixMaxLength and findSuffixMaxLength and isWordValidFromTray', () => {
        chai.spy.on(gameMode, 'findPrefixMaxLength');
        chai.spy.on(gameMode, 'findSuffixMaxLength');
        chai.spy.on(service, 'isWordValidFromTray');
        const wordOnBoard: WordOnBoard = {
            startPosition: 12,
            word: 'de',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];

        service.getPotentialWordsFromDictionary(0, wordOnBoard);
        expect(gameMode.findPrefixMaxLength).to.have.been.called;
        expect(gameMode.findSuffixMaxLength).to.have.been.called;
        expect(service.isWordValidFromTray).to.have.been.called;
    });

    it('isWordValidFromTray should return true', () => {
        const tray = ['a', 'b', 'c', 'd', 'e'];
        const word = 'ab';

        service.isWordValidFromTray(tray, word);
        expect(service.isWordValidFromTray(tray, word)).to.be.false;
    });

    it('isWordAlreadyPlacedInSamePositionOnBoard should return potential word placed in the same position as word on board', () => {
        const potentialWord = 'de';
        const wordOnBoard: WordOnBoard = {
            startPosition: 1,
            word: 'de',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        expect(service.isWordAlreadyPlacedInSamePositionOnBoard(potentialWord, wordOnBoard, 0)).to.be.false;
    });

    it('isWordAlreadyPlacedInSamePositionOnBoard should return potential word placed in the same position as word on board', () => {
        const potentialWord = 'de';
        const wordOnBoard: WordOnBoard = {
            startPosition: 1,
            word: 'de',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[1][wordOnBoard.startPosition].letter = wordOnBoard.word[1];
        expect(service.isWordAlreadyPlacedInSamePositionOnBoard(potentialWord, wordOnBoard, 0)).to.be.true;
    });

    it('getCommandAction should call expertVirtualPlayerCommandAction if VirtualPlayerDifficulty is expert', () => {
        chai.spy.on(service, 'expertVirtualPlayerCommandAction');
        service.getCommandAction(VirtualPlayerDifficulty.Expert);
        expect(service['expertVirtualPlayerCommandAction']).to.be.called;

    });

    it('isPotentialWordCreatedByTray should return potential word created by tray', () => {
        const potentialWord = 'de';
        const wordOnBoard: WordOnBoard = {
            startPosition: 1,
            word: 'de',
        };
        expect(service.isPotentialWordCreatedByTray(potentialWord, wordOnBoard)).to.be.true;
    });

    it('isPotentialWordValid should return potential word invalid ', () => {
        const potentialWord = 'de';
        const wordOnBoard: WordOnBoard = {
            startPosition: 1,
            word: 'de',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        expect(service.isPotentialWordValid(wordOnBoard, 0, potentialWord)).to.not.be.false;
    });

    it('isPotentialWordValid should return potential word not valid ', () => {
        const potentialWord = 'va';
        const wordOnBoard: WordOnBoard = {
            startPosition: 1,
            word: 'de',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        expect(service.isPotentialWordValid(wordOnBoard, 0, potentialWord)).to.be.false;
    });

    it('isPotentialWordValid should return potential word not valid because letters are not in tray', () => {
        const potentialWord = 'xy';
        const wordOnBoard: WordOnBoard = {
            startPosition: 1,
            word: 'de',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        chai.spy.on(service, 'isPotentialWordCreatedByTray', () => false);
        expect(service.isPotentialWordValid(wordOnBoard, 0, potentialWord)).to.be.false;
    });

    it('getPotentialWordsForRow should call getPotentialWordsFromDictionary', () => {
        chai.spy.on(service, 'getPotentialWordsFromDictionary');
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        gameMode.board[0][wordOnBoard.startPosition + 2].letter = wordOnBoard.word[2];
        service.getPotentialWordsForRow(0, wordOnBoard);
        expect(service.getPotentialWordsFromDictionary).to.have.been.called;
    });

    it('getPotentialWordsForRow should call getPotentialWordsFromDictionary', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[0][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[0][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        gameMode.board[0][wordOnBoard.startPosition + 2].letter = wordOnBoard.word[2];
        gameMode.board[0][wordOnBoard.startPosition + 3].letter = wordOnBoard.word[3];
        chai.spy.on(service, 'getPotentialWordsFromDictionary', () => ['decafe']);
        service.getPotentialWordsForRow(0, wordOnBoard);
        expect(service.getPotentialWordsFromDictionary).to.have.been.called;
    });

    it('getPotentialWordsForBoard should call transposeBoard, getWordOnBoard, getPotentialWordsForRow, generateScoreForPotentialWords when direction v', () => {
        chai.spy.on(service, 'getPotentialWordsForRow');
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 0,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = wordOnBoard.word[2];
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = wordOnBoard.word[3];
        chai.spy.on(validationService, 'transposeBoard');
        chai.spy.on(validationService, 'getWordOnBoard', () => wordOnBoard);
        chai.spy.on(scoreService, 'generateScoreForPotentialWords', () => [potentialWord]);
        service.getPotentialWordsForBoard('v');
        expect(validationService.transposeBoard).to.have.been.called;
        expect(validationService.getWordOnBoard).to.have.been.called;
        expect(service.getPotentialWordsForRow).to.have.been.called;
        expect(scoreService.generateScoreForPotentialWords).to.have.been.called;
    });
    it('should call getWordOnBoard, getPotentialWordsForRow, generateScoreForPotentialWords when direction h', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 0,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = wordOnBoard.word[2];
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = wordOnBoard.word[3];

        chai.spy.on(service, 'getPotentialWordsForRow', () => [potentialWord]);
        chai.spy.on(validationService, 'getWordOnBoard');
        chai.spy.on(scoreService, 'generateScoreForPotentialWords');
        
        service.getPotentialWordsForBoard('h');
        expect(validationService.getWordOnBoard).to.have.been.called;
        expect(service.getPotentialWordsForRow).to.have.been.called;
        expect(scoreService.generateScoreForPotentialWords).to.have.been.called;
    });

    it('should call getWordOnBoard when word est vide', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: '',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = '';
        chai.spy.on(validationService, 'getWordOnBoard');

        service.getPotentialWordsForBoard('h');
        expect(validationService.getWordOnBoard).to.have.been.called;
    });
    it('should expect wordOnBoardexpected same as the word on board', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = wordOnBoard.word[0];
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = wordOnBoard.word[1];
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = wordOnBoard.word[2];
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = wordOnBoard.word[3];
        const wordOnBoardExpected: WordOnBoard = validationService.getWordOnBoard(3, gameMode.board);
        expect(wordOnBoardExpected).to.deep.equal(wordOnBoard);
    });
    /*it('should call getPotentialWordsFromDictionary and isPotentialWordValid', () => {
        service['commandChoiceProbability'] = TEST_PROBABILITY_I;
        gameMode.initializeGame(parameters);
        gameMode.initializationService.initializeBoard(BOARD_CONFIGURATION);
        chai.spy.on(service, 'getPotentialWordsFromDictionary');
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = '';

        chai.spy.on(service, 'isPotentialWordValid');
        service.getPotentialWordsForRow(3, wordOnBoard);
        //expect(service.getPotentialWordsFromDictionary).to.have.been.called;
        expect(service.isPotentialWordValid).to.have.been.called;
    });*/
    /*  it('should call getPotentialWordsForBoard and pickPotentialWord ', () => {
        service['commandChoiceProbability'] = TEST_PROBABILITY_I;
        gameMode.initializeGame(parameters);
        gameMode.initializationService.initializeBoard(BOARD_CONFIGURATION);

        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 0,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = 'c';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = 'a';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = 'f';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = 'e';

        chai.spy.on(service, 'getPotentialWordsForBoard', () => potentialWord);
        for (let i = 0; i <= NUMBER_OF_COMMAND_ACTION; i++) service.getCommandAction(VirtualPlayerDifficulty.Beginner);
        expect(service.getPotentialWordsForBoard).to.have.been.called;
        expect(scoreService.pickPotentialWord).to.have.been.called;
    });*/

    /* it('should call getPotentialWordsForBoard and pickPotentialWord ', () => {
        service['commandChoiceProbability'] = TEST_PROBABILITY_II;
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 0,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = 'c';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = 'a';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = 'f';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = 'e';

        chai.spy.on(service, 'getPotentialWordsForBoard', () => potentialWord);
        for (let i = 0; i <= NUMBER_OF_COMMAND_ACTION; i++) service.getCommandAction(VirtualPlayerDifficulty.Beginner);
        expect(service.getPotentialWordsForBoard).to.have.been.called;
        expect(scoreService.pickPotentialWord).to.have.been.called;
    });*/

    /*it('should call getPotentialWordsForBoard and pickPotentialWord ', () => {
        service['commandChoiceProbability'] = TEST_PROBABILITY_III;
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 0,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = 'c';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = 'a';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = 'f';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = 'e';

        chai.spy.on(service, 'getPotentialWordsForBoard', () => potentialWord);
        chai.spy.on(scoreService, 'pickPotentialWord', () => potentialWord);
        for (let i = 0; i <= NUMBER_OF_COMMAND_ACTION; i++) service.getCommandAction(VirtualPlayerDifficulty.Beginner);
        expect(service.getPotentialWordsForBoard).to.have.been.called;
        expect(scoreService.pickPotentialWord).to.have.been.called;
    });*/

    it('should call getPotentialWordsForBoard and pickPotentialWord  when word is undefined', () => {
        chai.spy.on(service, 'getPotentialWordsForBoard');
        chai.spy.on(scoreService, 'pickPotentialWord');
        service['commandChoiceProbability'] = TEST_PROBABILITY_I;
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.initializeGame(parameters);
        gameMode.board[3][wordOnBoard.startPosition].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = '';

        for (let i = 0; i <= NUMBER_OF_COMMAND_ACTION; i++) service.getCommandAction(VirtualPlayerDifficulty.Beginner);
        expect(service.getPotentialWordsForBoard).to.have.been.called;
        expect(scoreService.pickPotentialWord).to.have.been.called;
    });

    it('should call getPotentialWordsForBoard and pickPotentialWord  when word is undefined', () => {
        chai.spy.on(service, 'getPotentialWordsForBoard');
        chai.spy.on(scoreService, 'pickPotentialWord');
        service['commandChoiceProbability'] = TEST_PROBABILITY_II;
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.initializeGame(parameters);
        gameMode.board[3][wordOnBoard.startPosition].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = '';
        for (let i = 0; i <= NUMBER_OF_COMMAND_ACTION; i++) service.getCommandAction(VirtualPlayerDifficulty.Beginner);
        expect(service.getPotentialWordsForBoard).to.have.been.called;
        expect(scoreService.pickPotentialWord).to.have.been.called;
    });

    it('should call getCommandAction() and handleCommand(command) in runCommandActionVirtualPlayer()', () => {
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[3][wordOnBoard.startPosition].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 1].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 2].letter = '';
        gameMode.board[3][wordOnBoard.startPosition + 3].letter = '';
        // chai.spy.restore(chatBoxService,'addChat');
        chai.spy.on(service, 'getCommandAction', () => '!passer');
        chai.spy.on(commandService, 'handleCommand');
        // chai.spy.on(chatBoxService, 'addChat');
        service.runCommandActionVirtualPlayer();
        expect(service.getCommandAction).to.have.been.called;
        expect(commandService.handleCommand).to.have.been.called;
        expect(chatBoxService.addChat).to.have.been.called;
        // chai.spy.restore(commandService, 'handleCommand');
    });

    // it('runCommandActionVirtualPlayer should cal handleCommand and addChat', () => {
    //     setTimeout(() => {
    //         // chai.spy.on(commandService, 'handleCommand');
    //         // chai.spy.on(chatBoxService, 'addChat');
    //     }, THREE_SECONDS * ONE_SECOND_IN_MILLISECONDS);
    //     service.runCommandActionVirtualPlayer();

    //     setTimeout(() => {
    //         expect(commandService.handleCommand).to.have.been.called;
    //         expect(chatBoxService.addChat).to.have.been.called;
    //     }, THREE_SECONDS * ONE_SECOND_IN_MILLISECONDS);
    // });

    it('placeFirstTurn should call getWordMatches', () => {
        chai.spy.on(validationService, 'getWordMatches');

        service.placeFirstTurn();
        expect(validationService.getWordMatches).to.have.been.called;
    });

    it('placeFirstTurn should call getWordMatches', () => {
        chai.spy.on(debugService, 'createDebugMessage');
        Sinon.stub(validationService, 'getWordMatches').returns(['cafe']);

        service.placeFirstTurn();
        expect(debugService.createDebugMessage).to.have.been.called;
    });

    it('expertVirtualPlayerCommandAction should return !passer if reserve is empty', () => {
        Sinon.stub(service, 'getPotentialWordsForBoard').returns([]);
        Sinon.stub(gameMode.bank, 'getReserveNumber').returns(0);
        const returnMessage = service['expertVirtualPlayerCommandAction']();

        expect(returnMessage).to.not.be.undefined;
    });

    it('expertVirtualPlayerCommandAction should return !échanger  if reserve is not empty', () => {
        Sinon.stub(service, 'getPotentialWordsForBoard').returns([]);
        Sinon.stub(gameMode.bank, 'getReserveNumber').returns(15);
        const returnMessage = service['expertVirtualPlayerCommandAction']();

        expect(returnMessage).to.not.be.undefined;
    });

    it('placeFirstTurn should call bank.draw if command is !placer', (done) => {
        chai.spy.on(commandService, 'handleCommand');
        Sinon.stub(service, 'getCommandAction').returns('!placer h8h cafe');
        chai.spy.on(gameMode.bank, 'draw');
        service.placeFirstTurn();
        setTimeout(() => {
            expect(gameMode.bank.draw).to.have.been.called;
            done();
        }, THREE_SECONDS * ONE_SECOND_IN_MILLISECONDS * 2);
    });

    it('expertVirtualPlayerCommandAction should return !placer if potential words not empty (case:debug on)', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 0,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        gameMode.match.players[0].debugOn = true;
        Sinon.stub(service, 'getPotentialWordsForBoard').returns([potentialWord]);
        const returnMessage = service['expertVirtualPlayerCommandAction']();
        expect(chatBoxService.addChat).to.have.been.called;
        expect(returnMessage).to.not.be.undefined;
    });

    it('beginnerVirtualPlayerCommandAction should return !échanger if potentialWords.length === 0', () => {
        service['commandChoiceProbability'] = 0.5;
        Sinon.stub(service, 'getPotentialWordsForBoard').returns([]);
        const returnMessage = service['beginnerVirtualPlayerCommandAction']();
        expect(returnMessage).to.include('!échanger');
    });

    it('beginnerVirtualPlayerCommandAction should return !échanger if potentialWords.length === 0', () => {
        service['commandChoiceProbability'] = 0.5;
        Sinon.stub(service, 'getPotentialWordsForBoard').returns([]);
        const returnMessage = service['beginnerVirtualPlayerCommandAction']();
        expect(returnMessage).to.include('!échanger');
    });

    it('beginnerVirtualPlayerCommandAction should call addChat() if debug is on', () => {
        gameMode.match.players[0].debugOn = true;
        service['beginnerVirtualPlayerCommandAction']();
        expect(chatBoxService.addChat).to.have.been.called;
    });

    it('placeFirstTurn should call addChat() if debug is on', () => {
        Sinon.stub(validationService, 'getWordMatches').returns(['cafe', 'sieste', 'hippopotamuseses']);
        gameMode.match.players[0].debugOn = true;
        service.placeFirstTurn();
        expect(chatBoxService.addChat).to.have.been.called;
    });

    it('getPotentialWordsFromDictionary should filter results', () => {
        Sinon.stub(validationService, 'getWordMatches').returns(['cafe', 'sieste', 'hippopotamuseses']);
        const wordOnBoard: WordOnBoard = {
            startPosition: 12,
            word: 'de',
        };
        service.getPotentialWordsFromDictionary(2, wordOnBoard);
        expect(service.getPotentialWordsFromDictionary(2, wordOnBoard).length).to.equal(1);
    });

    it('getPotentialWordsForRow should call push if word is not on board', () => {
        Sinon.stub(validationService, 'isWordAlreadyOnBoard').returns(false);
        Sinon.stub(validationService, 'getWordMatches').returns(['cafe']);
        const wordOnBoard: WordOnBoard = {
            startPosition: 12,
            word: 'de',
        };
        const result = service.getPotentialWordsForRow(2, wordOnBoard);
        expect(result).to.not.be.undefined;
    });
});
