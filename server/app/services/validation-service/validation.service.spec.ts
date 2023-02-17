/*eslint-disable */
import { PlaceCommandParameters } from '@app/classes/place-command-parameters/place-command-parameters';
import { MatchType } from '@common/match/match';
import { NewLetterToPlace } from '@common/new-letter-to-place/new-letter-to-place';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { PotentialWord } from '@common/potential-word/potential-word';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { DictionnaryService } from '../dictionnary-service/dictionnary.service';
import {
    CommandStatus,
    FIVE_TEST_INDEX,
    FOURTEEN_TEST_INDEX,
    MAX_COLUMN_INDEX,
    MAX_ROW_INDEX,
    NINE_TEST_INDEX,
    RESULTED_WORDS_SCORE_II,
} from './../../../../common/constants/constants';
import { WordOnBoard } from './../../../../common/word-placement/word-placement';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;
    let gameMode: GameModeService;
    let dictionaryService: DictionnaryService;
    chai.use(spies);

    beforeEach(() => {
        service = Container.get(ValidationService);

        gameMode = Container.get(GameModeService);
        service['gameModeService'] = gameMode;
        dictionaryService = Container.get(DictionnaryService);

        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };

        gameMode.initializeGame(parameters);
        gameMode.board[5][2].letter = 'c';
        gameMode.board[5][3].letter = 'a';
        gameMode.board[5][4].letter = 'f';
        gameMode.board[5][5].letter = 'e';
        gameMode.board[4][5].letter = 'd';
        gameMode.board[6][5].letter = 'u';
        gameMode.board[7][5].letter = 'x';
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(ValidationService);
    });

    it('getVerticalWordAbove() return nothing when we are in row 0 ', () => {
        expect(service.getVerticalWordAbove(0, 2, gameMode.board)).to.equal('');
    });

    it('getVerticalWordAbove() should return d as word above e if called', () => {
        expect(service.getVerticalWordAbove(FIVE_TEST_INDEX, FIVE_TEST_INDEX, gameMode.board)).to.equal('d');
    });

    it('should return ux as word below e on call of getVerticalWordAbove()', () => {
        expect(service.getVerticalWordBelow(FIVE_TEST_INDEX, FIVE_TEST_INDEX, gameMode.board)).to.equal('ux');
    });

    it('should test the return of getVerticalWordAbove() when we are in column 0 ', () => {
        expect(service.getVerticalWordBelow(MAX_ROW_INDEX, 3, gameMode.board)).to.equal('');
    });

    it('should test isCrossCheckOnColumnValid() case one char ', () => {
        const newLetterToPlace: NewLetterToPlace = {
            columnIndex: 3,
            rowIndex: FIVE_TEST_INDEX,
            letter: 'a',
            board: gameMode.board,
        };
        expect(service.isCrossCheckOnColumnValid(newLetterToPlace)).to.equal(true);
    });

    it('should test isCrossCheckOnColumnValid() case word valid ', () => {
        const newLetterToPlace: NewLetterToPlace = {
            columnIndex: FIVE_TEST_INDEX,
            rowIndex: FIVE_TEST_INDEX,
            letter: 'e',
            board: gameMode.board,
        };
        expect(service.isCrossCheckOnColumnValid(newLetterToPlace)).to.equal(true);
    });

    it('of getHorizontalWordOnRight() should return fe as word on right if called', () => {
        expect(service.getHorizontalWordOnRight(3, FIVE_TEST_INDEX, gameMode.board)).to.equal('fe');
    });

    it('getHorizontalWordOnRight() should return nothing when we are in last column index ', () => {
        expect(service.getHorizontalWordOnRight(FIVE_TEST_INDEX, MAX_COLUMN_INDEX, gameMode.board)).to.equal('');
    });

    it('getHorizontalWordOnLeft() should return fe as word on right of if called ', () => {
        expect(service.getHorizontalWordOnLeft(3, FIVE_TEST_INDEX, gameMode.board)).to.equal('c');
    });

    it('getHorizontalWordOnLeft() should test when we are in first column index ', () => {
        expect(service.getHorizontalWordOnLeft(0, FIVE_TEST_INDEX, gameMode.board)).to.equal('');
    });

    it('isPotentialWordPlacedOnRowInDictionary() should test prefix on first column', () => {
        const potentialWord = 'decafeina';

        const wordOnBoard: WordOnBoard = service.getWordOnBoard(FIVE_TEST_INDEX, gameMode.board);

        expect(service.isPotentialWordPlacedOnRowInDictionary(potentialWord, wordOnBoard, FIVE_TEST_INDEX, gameMode.board)).to.equal(true);
    });

    it('isPotentialWordPlacedOnRowInDictionary() should test when normal suffix is given', () => {
        gameMode.board[9][7].letter = 'a';
        gameMode.board[9][8].letter = 'm';
        gameMode.board[9][9].letter = 'i';
        const potentialWord = 'tamia';
        const wordOnBoard: WordOnBoard = service.getWordOnBoard(NINE_TEST_INDEX, gameMode.board);
        expect(service.isPotentialWordPlacedOnRowInDictionary(potentialWord, wordOnBoard, NINE_TEST_INDEX, gameMode.board)).to.equal(true);
    });

    it('isPotentialWordPlacedOnRowInDictionary should test if normal prefix is given', () => {
        gameMode.board[9][7].letter = 'a';
        gameMode.board[9][8].letter = 'm';
        gameMode.board[9][9].letter = 'i';
        const potentialWord = 'tamia';
        const wordOnBoard: WordOnBoard = service.getWordOnBoard(NINE_TEST_INDEX, gameMode.board);
        expect(service.isPotentialWordPlacedOnRowInDictionary(potentialWord, wordOnBoard, NINE_TEST_INDEX, gameMode.board)).to.equal(true);
    });

    it('isPotentialWordPlacedOnRowInDictionary() should test when word is in last column index', () => {
        gameMode.board[14][13].letter = 'd';
        gameMode.board[14][14].letter = 'e';

        const potentialWord = 'deux';
        const wordOnBoard: WordOnBoard = service.getWordOnBoard(FOURTEEN_TEST_INDEX, gameMode.board);
        expect(service.isPotentialWordPlacedOnRowInDictionary(potentialWord, wordOnBoard, FOURTEEN_TEST_INDEX, gameMode.board)).to.equal(true);
    });

    it('validateWordForHumanPlayer() should check valid command case the placement is horizontal', () => {
        const placeParams: PlaceCommandParameters = {
            row: 5,
            column: 0,
            direction: 'h',
            word: 'decafeina',
        };

        expect(service.validateWordForHumanPlayer(placeParams)).to.be.equal(CommandStatus.SUCESS_PLACE_COMMAND_DICTIONNARY_VALIDE);
    });

    it('validateWordForHumanPlayer() should return success command case vertical placement', () => {
        const placeParams: PlaceCommandParameters = {
            row: 5,
            column: 4,
            direction: 'v',
            word: 'deuxieme',
        };

        expect(service.validateWordForHumanPlayer(placeParams)).to.be.equal(CommandStatus.SUCESS_PLACE_COMMAND_DICTIONNARY_VALIDE);
    });

    it('validateWordForHumanPlayer() should test the case when isCrossCheckOnColumnValid() returns false  ', () => {
        const placeParams: PlaceCommandParameters = {
            row: 5,
            column: 4,
            direction: 'h',
            word: 'deuxieme',
        };
        gameMode.match.activePlayer = 0;
        chai.spy.on(service, 'isCrossCheckOnColumnValid', () => false);

        expect(service.validateWordForHumanPlayer(placeParams)).to.be.equal(CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE);
    });

    it('addBonusToScore should return score with bonus added', () => {
        let score = 14;
        score = service.addBonusToScore(score);
        expect(score).to.equal(RESULTED_WORDS_SCORE_II);
    });

    it('isWordAlreadyOnBoard function should check if word is already on board', () => {
        const potentialWords: PotentialWord[] = Array<PotentialWord>();
        const potentialWord: PotentialWord = {
            word: 'cafe',
            score: 0,
            startPosition: {
                row: 1,
                column: 5,
            },
        };
        potentialWords.push(potentialWord);
        // gameMode.wordsOnBoard = potentialWords; A verifier
        expect(service.isWordAlreadyOnBoard(potentialWord)).to.equal(false);
    });

    it('should return impacted words if getImpactedWords function is called', () => {
        const impactedWord = ['a', 'a'];
        expect(service.getImpactedWords(7, 7, 'aa')).to.be.deep.equal(impactedWord);
    });

    it('pickPotentialWord function should return a potentialWord', () => {
        const potentialWord1: PotentialWord = {
            word: 'cafe',
            score: 0,
            startPosition: {
                row: 1,
                column: 5,
            },
        };
        const potentialWord2: PotentialWord = {
            word: 'aa',
            score: 0,
            startPosition: {
                row: 1,
                column: 5,
            },
        };

        const potentialWordReturned: PotentialWord = service.pickPotentialWord([potentialWord1, potentialWord2]);
        expect(potentialWordReturned).to.be.equal(potentialWord2);
    });

    it('validateWordForHumanPlayer function should return command status valid if human placement is valid', () => {
        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        dictionaryService.loadDictionaryFromAssets('Mon dictionnaire');
        gameMode.initializeGame(parameters);
        gameMode.match.type = MatchType.Multiplayer;
        const placeParams: PlaceCommandParameters = {
            row: 7,
            column: 8,
            direction: 'h',
            word: 'aa',
        };
        dictionaryService.wordList = ['aa'];
        gameMode.board[7][7].letter = '';
        expect(service.validateWordForHumanPlayer(placeParams)).to.be.equal(5);
    });

    it('ValidateForHumanPlayer function should return placement possible if word is already in board', () => {
        gameMode.match.type = MatchType.Multiplayer;
        const placeParams: PlaceCommandParameters = {
            row: 10,
            column: 9,
            direction: 'h',
            word: 'aa',
        };
        const stubOn = Sinon.stub(service, 'isWordAlreadyOnBoard').returns(true);
        expect(service.validateWordForHumanPlayer(placeParams)).to.be.equal(7);
        expect(stubOn.called).to.be.true;
        stubOn.restore();
    });

    it('validateForHumanPlayer function should return Error placement impossible if the placement is not possible', () => {
        gameMode.match.type = MatchType.Multiplayer;
        const placeParams: PlaceCommandParameters = {
            row: 10,
            column: 9,
            direction: 'h',
            word: 'aa',
        };
        gameMode.board[7][7].letter = 'a';
        service.isPlacementNearExistingWord(placeParams, gameMode.board);
        expect(service.validateWordForHumanPlayer(placeParams)).to.be.equal(7);
    });

    it('iswordisalreadyonBoard function should find if word is already on board', () => {
        gameMode.match.wordsOnBoard = [{ word: 'aa', score: 0, startPosition: { row: 7, column: 7 } }];
        const potentialWord: PotentialWord = { word: 'aa', score: 0, startPosition: { row: 7, column: 7 } };
        expect(service.isWordAlreadyOnBoard(potentialWord)).to.be.true;
    });

    it('iswordisalreadyonBoard function should return false if not word on board', () => {
        gameMode.match.wordsOnBoard = [{ word: '', score: 0, startPosition: { row: 7, column: 7 } }];
        const potentialWord: PotentialWord = { word: 'aa', score: 0, startPosition: { row: 7, column: 7 } };
        expect(service.isWordAlreadyOnBoard(potentialWord)).to.be.false;
    });
});
