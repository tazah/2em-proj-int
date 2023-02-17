import { DictionnaryCollectionService } from '@app/services/database-services/dictionary-collection-service/dictionary-collection.service';
/*eslint-disable */
import { Box } from '@common/box/box';
import { BOARD_CONFIGURATION, MAX_ROW } from '@common/constants/constants';
import { Match, MatchType, State } from '@common/match/match';
import { Objective } from '@common/objective/objective';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { Player } from '@common/player/player';
import { PotentialWord } from '@common/potential-word/potential-word';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import Container from 'typedi';
import { DictionnaryService } from '../dictionnary-service/dictionnary.service';
import { ObjectiveParameters } from './../../../../common/objective-parameters/objective-parameters';
import { ObjectiveType } from './../../../../common/objective/objective';
import { PlaceCommandParameters } from './../../classes/place-command-parameters/place-command-parameters';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { ObjectivesService } from './objectives.service';

describe('ObjectivesService', () => {
    let service: ObjectivesService;
    let gameMode: GameModeService;
    chai.use(spies);

    beforeEach(async () => {
        gameMode = Container.get(GameModeService);
        service = new ObjectivesService(new DictionnaryService(new DictionnaryCollectionService()));
        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        gameMode.initializeGame(parameters);
    });

    it('should return true if score is above one hundred', () => {
        const returnedValue = service.isScoreSuperiorToHundred(200);
        expect(returnedValue).to.be.true;
    });

    it('should return true if score is less than one hundred', () => {
        const returnedValue = service.isScoreSuperiorToHundred(99);
        expect(returnedValue).to.be.false;
    });

    it('should return true if score is prime', () => {
        const score = 11;
        const returnedValue = service.isScorePrime(score);
        expect(returnedValue).to.be.true;
    });

    it('should return false if score is not prime', () => {
        const score = 12;
        const returnedValue = service.isScorePrime(score);
        expect(returnedValue).to.be.false;
    });

    it('isObjectiveReached should return false if word is not palindrome', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'ali',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 0, 200);
        expect(isObjectiveReached).to.be.false;
    });

    it('isObjectiveReached should return false if an objective is not reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'not nik',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 1, 200);
        expect(isObjectiveReached).to.be.false;
    });

    it('isObjectiveReached should return true if objective (word is the magic word) is reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'nik',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 1, 200);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return true if (the fist letter is same at the last letter) objective is reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'aya',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 2, 200);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return true if objective (score is above than one hundred) is reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'aya',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 3, 200);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return true if objective (word has three vowels) is reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'aya',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 4, 200);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return true if word has three vowels', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'aya',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 4, 200);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return true if objective (score is prime) is reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'aya',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 5, 11);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return true if objective (word length is ten) is reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'salamsalam',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 6, 11);
        expect(isObjectiveReached).to.be.true;
    });

    it('isObjectiveReached should return false if objective (word is semordnilap) is not reached', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'ayal',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 7, 11);
        expect(isObjectiveReached).to.be.false;
    });

    it('isObjectiveReached should return false if the index of the objective not exist', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'ayal',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const isObjectiveReached = service.isObjectiveReached(objective, 10, 11);
        expect(isObjectiveReached).to.be.false;
    });

    it('should return true if word placed lenght is above ten', () => {
        const isWordAboveTen = service.isLengthFormedWordTen('salamsalam', ['', '']);
        expect(isWordAboveTen).to.be.true;
    });

    it('should return false if word placed lenght is less than ten', () => {
        const isWordAboveTen = service.isLengthFormedWordTen('salamsal', ['', '']);
        expect(isWordAboveTen).to.be.false;
    });

    it('checkPublicObjective function should not return an objective if not public objective is found', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'saa',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const initialObjective: Objective = {
            index: 2,
            description: 'place a word which lenghth is above ten',
            name: 'lenghtAboveTen',
            type: ObjectiveType.Private,
            isReached: true,
            score: 0,
            isPicked: false,
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        const Objective = service.checkPublicObjectives(objective, player1);

        expect(Objective.length).to.equal(0);
    });

    it('checkPublicObjective function should return an objective if  public objective is found', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'nik',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const initialObjective: Objective = {
            index: 1,
            description: 'Former le mot magique "NIK"',
            name: 'Objective 1',
            type: ObjectiveType.Public,
            isReached: false,
            score: 200,
            isPicked: false,
        };

        const match: Match = {
            players: new Array<Player>(),
            activePlayer: 0,
            parameters: {
                dictionary: 'Mon dictionnaire',
                timer: 60,
                creatorName: '',
                isBoxTypeRandom: false,
                mode: GameModeType.log2990,
                difficulty: VirtualPlayerDifficulty.Beginner,
            },
            mode: 'classique',
            state: State.Initialization,
            type: MatchType.Solo,
            debugOn: false,
            winner: 0,
            gameOver: false,
            numberOfConsecutivePasses: 0,
            numberOfTotalPasses: 0,
            wordsOnBoard: new Array<PotentialWord>(),
            boardConfiguration: BOARD_CONFIGURATION,
            publicObjectives: [initialObjective, initialObjective],
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        gameMode.match = match;
        service.initializeObjectives();
        const possibleObjectives = service.pickObjectives(2, true);
        gameMode.match.publicObjectives = possibleObjectives;

        const Objective = service.checkPublicObjectives(objective, player1);

        expect(Objective.length).to.equal(2);
    });

    it('pickObjectives function should pick a private objective', () => {
        service.initializeObjectives();
        const possibleObjectives = service.pickObjectives(1, false);

        expect(possibleObjectives.length).to.equal(1);
    });

    it('CheckPublicObjective should add score to player if the public objective is achieved', () => {
        gameMode.board = new Array<Box[]>(MAX_ROW);
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'nik',
        };
        const initialPlayerObjective: Objective = {
            index: 1,
            description: 'Former le mot magique "NIK"',
            name: '1',
            type: ObjectiveType.Public,
            isReached: true,
            score: 200,
            isPicked: true,
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 50,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialPlayerObjective,
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const initialObjective: Objective = {
            index: 1,
            description: 'Former le mot magique "NIK"',
            name: '1',
            type: ObjectiveType.Public,
            isReached: false,
            score: 200,
            isPicked: true,
        };
        const match: Match = {
            players: new Array<Player>(),
            activePlayer: 0,
            parameters: {
                dictionary: 'dictionary1',
                timer: 60,
                creatorName: '',
                isBoxTypeRandom: false,
                mode: GameModeType.log2990,
                difficulty: VirtualPlayerDifficulty.Beginner,
            },
            mode: 'classique',
            state: State.Initialization,
            type: MatchType.Solo,
            debugOn: false,
            winner: 0,
            gameOver: false,
            numberOfConsecutivePasses: 0,
            numberOfTotalPasses: 0,
            wordsOnBoard: new Array<PotentialWord>(),
            boardConfiguration: BOARD_CONFIGURATION,
            publicObjectives: [initialObjective, initialObjective],
        };
        match.players = [player1];
        service.checkPublicObjectives(objective, player1);
        expect(player1.score).to.not.equal(0);
    });

    it('should pick two objectives if pickObjective function is called with two as parameter', () => {
        const returnedObjective = service.pickObjectives(2, true);
        expect(returnedObjective.length).to.equal(2);
    });

    it('checkPrivateObjective function should not add score to player if objective is not exist', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'salamsamaaa',
        };
        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const initialObjective: Objective = {
            index: 2,
            description: 'place a word which lenghth is above ten',
            name: 'lenghtAboveTen',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: true,
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        service.checkPrivateObjective(objective, player1);

        expect(player1.score).to.equal(0);
    });

    it('hasThreeVowels function should return true if number of vowels is above or equal three', () => {
        const isWordIncludeThreeVowels = service.hasThreeVowels('anike');
        expect(isWordIncludeThreeVowels).to.be.true;
    });

    it('checkPrivateObjective function should not add score to player if objective is not achieved', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'nik',
        };

        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const initialObjective: Objective = {
            index: 1,
            description: 'Former le mot magique "NIK"',
            name: '1',
            type: ObjectiveType.Public,
            isReached: false,
            score: 200,
            isPicked: true,
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        const match: Match = {
            players: new Array<Player>(),
            activePlayer: 0,
            parameters: {
                dictionary: 'dictionary1',
                timer: 60,
                creatorName: '',
                isBoxTypeRandom: false,
                mode: GameModeType.log2990,
                difficulty: VirtualPlayerDifficulty.Beginner,
            },
            mode: 'classique',
            state: State.Initialization,
            type: MatchType.Solo,
            debugOn: false,
            winner: 0,
            gameOver: false,
            numberOfConsecutivePasses: 0,
            numberOfTotalPasses: 0,
            wordsOnBoard: new Array<PotentialWord>(),
            boardConfiguration: BOARD_CONFIGURATION,
            publicObjectives: [initialObjective, initialObjective],
        };
        match.players = [player1];
        service.checkPrivateObjective(objective, player1);
        expect(player1.score).to.not.equal(0);
    });

    it('checkPrivateObjective function should not add score to player if objective is not achieved', () => {
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'nik',
        };

        const objective: ObjectiveParameters = {
            placeParameters: placeParameter,
            impactedWords: ['', ''],
        };
        const initialObjective: Objective = {
            index: 1,
            description: 'Former le mot magique "NIK"',
            name: '1',
            type: ObjectiveType.Public,
            isReached: true,
            score: 200,
            isPicked: true,
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        const match: Match = {
            players: new Array<Player>(),
            activePlayer: 0,
            parameters: {
                dictionary: 'dictionary1',
                timer: 60,
                creatorName: '',
                isBoxTypeRandom: false,
                mode: GameModeType.log2990,
                difficulty: VirtualPlayerDifficulty.Beginner,
            },
            mode: 'classique',
            state: State.Initialization,
            type: MatchType.Solo,
            debugOn: false,
            winner: 0,
            gameOver: false,
            numberOfConsecutivePasses: 0,
            numberOfTotalPasses: 0,
            wordsOnBoard: new Array<PotentialWord>(),
            boardConfiguration: BOARD_CONFIGURATION,
            publicObjectives: [initialObjective, initialObjective],
        };
        match.players = [player1];
        service.checkPrivateObjective(objective, player1);
        expect(player1.score).to.equal(0);
    });
});
