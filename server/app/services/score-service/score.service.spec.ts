/*eslint-disable */
import { PlaceCommandParameters } from '@app/classes/place-command-parameters/place-command-parameters';
import { Trie } from '@app/classes/trie/trie';
import { ScoreType } from '@common/box/box';
import { Coordinates } from '@common/coordinates/coordinates';
import { NewLetterToPlace } from '@common/new-letter-to-place/new-letter-to-place';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { PotentialWord } from '@common/potential-word/potential-word';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { BEGINNER_VIRTUAL_PLAYERS } from './../../../../common/constants/constants';
import {
    POTENTIAL_WORD_RANGE_MAX,
    POTENTIAL_WORD_RANGE_MIN,
    PREDEFINED_RANDOM_VALUE,
    RANDOM_OFFSET,
    RESULTED_WORDS_SCORE,
    RESULTED_WORDS_SCORE_III,
    RESULTED_WORDS_SCORE_IV,
    SCORE_OF_TEST_DOUBLE_LETTER,
    SCORE_OF_TEST_DOUBLE_WORD,
    SCORE_TEST_RANGE_MAX,
    SECOND_PREDEFINED_RANDOM_VALUE,
    TEST_SCORE_COLUMN_INDEX,
    THIRD_PREDEFINED_RANDOM_VALUE,
} from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { WordOnBoard } from './../../../../common/word-placement/word-placement';
import { CommandService } from './../command-service/command.service';
import { DictionnaryService } from './../dictionnary-service/dictionnary.service';
import { GameManager } from './../game-manager/game-manager.service';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { ScoreService } from './score.service';

describe('ScoreService', () => {
    let scoreService: ScoreService;
    let gameManager: GameManager;
    let gameMode: GameModeService;
    let dictionaryService: DictionnaryService;
    let parameters:Parameters;
    let commandService: CommandService;
    let player: Player;
    chai.use(spies);

    beforeEach(() => {
        gameManager = Container.get(GameManager);
        Sinon.stub(gameManager.initializationService,'setVirtualOpponentName').returns(BEGINNER_VIRTUAL_PLAYERS[0].name);
        scoreService = gameManager.scoreService;
        gameMode = gameManager.gameModeService;
        commandService = gameManager.commandService;
        dictionaryService = gameManager.dictionnaryService;
         parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        gameMode.initializeGame(parameters);
        dictionaryService.loadDictionaryFromAssets('Mon dictionnaire');
        const wordOnBoard: WordOnBoard = {
            startPosition: 5,
            word: 'cafe',
        };
        gameMode.board[10][wordOnBoard.startPosition].letter = 'c';
        gameMode.board[10][wordOnBoard.startPosition + 1].letter = 'a';
        gameMode.board[10][wordOnBoard.startPosition + 2].letter = 'f';
        gameMode.board[10][wordOnBoard.startPosition + 3].letter = 'e';
        gameMode.board[11][3].letter = 't';
        gameMode.board[10][3].letter = 'e';
        gameMode.match.players[gameMode.match.activePlayer].tray = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    });

    afterEach(()=>{
        dictionaryService.trie = new Trie();
        dictionaryService.wordList = Array<string>();
        Sinon.restore();
    })

    it('ScoreService should be created', () => {
        expect(scoreService).to.be.instanceOf(ScoreService);
    });

    it('countWordScore should count Potential Word Score (case: double word box)', () => {
        const newLetterToPlace: NewLetterToPlace = {
            columnIndex: 2,
            rowIndex: 2,
            letter: 'test',
            board: gameMode.board,
        };
        expect(scoreService.countWordScore(newLetterToPlace)).to.be.equal(SCORE_OF_TEST_DOUBLE_WORD);
    });

    it('countPotentialWordScore should count Potential Word Score (case: double letter box)', () => {
        expect(scoreService.countPotentialWordScore('test', TEST_SCORE_COLUMN_INDEX)).to.be.equal(SCORE_OF_TEST_DOUBLE_LETTER);
    });

    it('getPotentialWordsScoresInRange should return potential words in range potentialWord', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 3,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        expect(scoreService.getPotentialWordsScoresInRange([potentialWord, potentialWord1], 0, SCORE_TEST_RANGE_MAX)).to.be.deep.equal([
            potentialWord,
        ]);
    });

    it('getPotentialWordsScoresInRange should return potential words in range potentialWord1', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 3,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        expect(scoreService.getPotentialWordsScoresInRange([potentialWord, potentialWord1], 0, SCORE_TEST_RANGE_MAX)).to.be.deep.equal([
            potentialWord1,
        ]);
    });
    it('getPotentialWordsScoresInRange should return SCORE_OF_UNDEFINED in  getPotentialWordsScoresInRange() ', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 6,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 3,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        expect(scoreService.getPotentialWordsScoresInRange([potentialWord, potentialWord1], POTENTIAL_WORD_RANGE_MIN, POTENTIAL_WORD_RANGE_MAX));
    });
    it('pickPotentialWord should return 0', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        for (let i = 0; i <= RANDOM_OFFSET; i++) {
            scoreService.pickPotentialWord([potentialWord, potentialWord1]);
        }
        expect(scoreService.pickPotentialWord([potentialWord, potentialWord1])).not.to.be.undefined;
    });
    it('pickPotentialWord should test pickPotentialWord() case probability under 0.4', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 10,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        chai.spy.restore(Math, 'random');
        chai.spy.on(Math, 'random', () => PREDEFINED_RANDOM_VALUE);
        expect(scoreService.pickPotentialWord([potentialWord, potentialWord1])).to.equal(potentialWord1);
    });

    it('pickPotentialWord should test pickPotentialWord() case probability under 0.6', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 10,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        chai.spy.restore(Math, 'random');
        chai.spy.on(Math, 'random', () => SECOND_PREDEFINED_RANDOM_VALUE);
        expect(scoreService.pickPotentialWord([potentialWord, potentialWord1])).to.be.deep.equal(potentialWord1);
    });

    it('pickPotentialWord should test pick word case probability under 0.4', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 10,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        chai.spy.restore(Math, 'random');
        chai.spy.on(Math, 'random', () => THIRD_PREDEFINED_RANDOM_VALUE);
        expect(scoreService.pickPotentialWord([potentialWord, potentialWord1])).to.equal(potentialWord1);
    });

    it('generateScoreForPotentialWords should test generateScoreForPotentialWords()', () => {
        const potentialWord: PotentialWord = {
            word: 'decafe',
            score: 7,
            startPosition: {
                row: 3,
                column: 3,
            },
        };
        const potentialWord1: PotentialWord = {
            word: 'acafe',
            score: 10,
            startPosition: {
                row: 3,
                column: 3,
            },
        };

        expect(scoreService.generateScoreForPotentialWords([potentialWord, potentialWord1])).to.be.deep.equal([potentialWord, potentialWord1]);
    });
    it('calculateScoreOfTurn should return turn score', () => {
        /* const startPosition: Coordinates = {
            row: 10,
            column: 5,
        };*/
        const params: PlaceCommandParameters = {
            row: 10,
            column: 5,
            direction: 'h',
            word: 'cafe',
        };
        chai.spy.restore(scoreService, 'transposeBoard');
        chai.spy.restore(scoreService, 'countWordScore');
        chai.spy.restore(scoreService, 'clearBoxTypeValue');
        chai.spy.on(scoreService, 'transposeBoard');
        chai.spy.on(scoreService, 'countWordScore');
        chai.spy.on(scoreService, 'clearBoxTypeValue');
        scoreService.calculateScoreOfTurn(params);
    });

    it('should return turn score on call of calculateScoreOfResultedWords()', () => {
        const startPosition: Coordinates = {
            row: 2,
            column: 3,
        };
        chai.spy.restore(scoreService, 'transposeBoard');
        chai.spy.restore(scoreService, 'countWordScore');
        chai.spy.restore(scoreService, 'clearBoxTypeValue');
        chai.spy.on(scoreService, 'transposeBoard');
        chai.spy.on(scoreService, 'countWordScore');
        chai.spy.on(scoreService, 'clearBoxTypeValue');
        gameMode.match.activePlayer = 0;
        gameMode.match.players[gameMode.match.activePlayer].tray = ['d', 'e', 'c', 'a', 'f', 'e', 'i'];
        gameMode.match.players[gameMode.match.activePlayer].name = 'Karim';
        player = gameMode.match.players[gameMode.match.activePlayer];
        commandService.handleCommand('!placer b3h cafe', player);
        expect(scoreService.calculateScoreOfResultedWords(gameMode.board, 'cafe', startPosition)).to.equal(0);
    });

    it('should return turn score on call of calculateScoreOfResultedWords()', () => {
        const startPosition: Coordinates = {
            row: 1,
            column: 8,
        };
        chai.spy.restore(scoreService, 'transposeBoard');
        chai.spy.restore(scoreService, 'countWordScore');
        chai.spy.restore(scoreService, 'clearBoxTypeValue');
        chai.spy.on(scoreService, 'transposeBoard');
        chai.spy.on(scoreService, 'countWordScore');
        chai.spy.on(scoreService, 'clearBoxTypeValue');
        gameMode.match.activePlayer = 0;
        gameMode.match.players[gameMode.match.activePlayer].tray = ['d', 'e', 'c', 'a', 'f', 'e', 'i'];
        gameMode.match.players[gameMode.match.activePlayer].name = 'Kat';
        player = gameMode.match.players[gameMode.match.activePlayer];
        commandService.handleCommand('!placer a8v cafe', player);
        expect(scoreService.calculateScoreOfResultedWords(gameMode.board, 'cafe', startPosition)).to.equal(0);
    });

    it('should calculate score of resulted words with bonus letter', () => {
        const potentialWord = 'cafes';
        const wordRowIndex = 3;
        const wordColumnIndex = 0;
        gameMode.board[3][0].letter = 'c';
        gameMode.board[3][1].letter = 'a';
        gameMode.board[3][2].letter = 'f';
        gameMode.board[3][3].letter = 'e';
        gameMode.board[3][4].letter = 's';
        gameMode.board[4][0].letter = 'h';
        gameMode.board[5][0].letter = 'a';
        gameMode.board[6][0].letter = 't';
        gameMode.board[2][3].letter = 'd';
        gameMode.board[4][3].letter = 's';
        expect(scoreService.calculateScoreOfResultedWords(gameMode.board, potentialWord, { row: wordRowIndex, column: wordColumnIndex })).to.equal(
            RESULTED_WORDS_SCORE,
        );
    });

    it('should calculate score of resulted words with bonus words', () => {
        const potentialWord = 'cafes';
        const wordRowIndex = 4;
        const wordColumnIndex = 0;
        gameMode.board[4][0].letter = 'c';
        gameMode.board[4][1].letter = 'a';
        gameMode.board[4][2].letter = 'f';
        gameMode.board[4][3].letter = 'e';
        gameMode.board[4][4].letter = 's';
        gameMode.board[5][0].letter = 'h';
        gameMode.board[6][0].letter = 'a';
        gameMode.board[7][0].letter = 't';
        gameMode.board[3][3].letter = 'd';
        gameMode.board[5][3].letter = 's';
        expect(scoreService.calculateScoreOfResultedWords(gameMode.board, potentialWord, { row: wordRowIndex, column: wordColumnIndex })).to.equal(
            RESULTED_WORDS_SCORE_IV,
        );
    });

    it('should calculate score of resulted words', () => {
        const potentialWord = 'cafes';
        const wordRowIndex = 0;
        const wordColumnIndex = 0;
        gameMode.board[0][0].boxType.type = ScoreType.Word;
        gameMode.board[0][0].letter = 'c';
        gameMode.board[0][1].letter = 'a';
        gameMode.board[0][2].letter = 'f';
        gameMode.board[0][3].letter = 'e';
        gameMode.board[0][4].letter = 's';
        gameMode.board[1][0].letter = 'h';
        gameMode.board[2][0].letter = 'a';
        gameMode.board[3][0].letter = 't';
        scoreService.calculateScoreOfResultedWords(gameMode.board, potentialWord, { row: wordRowIndex, column: wordColumnIndex });
        expect(scoreService.calculateScoreOfResultedWords(gameMode.board, potentialWord, { row: wordRowIndex, column: wordColumnIndex })).to.equal(
            RESULTED_WORDS_SCORE_III,
        );
    });
});
