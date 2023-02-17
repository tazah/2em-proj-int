import { Service } from 'typedi';
import { Box, BoxType, ScoreCoefficient, ScoreType } from './../../../../common/box/box';
import {
    BEGINNER_VIRTUAL_PLAYERS,
    BOARD_CONFIGURATION,
    EIGHT,
    EXPERT_VIRTUAL_PLAYERS,
    MAX_COLUMN,
    MAX_ROW,
    MAX_TRY_COUNT,
    SIXTEEN,
    TWELVE,
    TWENTY_FOUR,
} from './../../../../common/constants/constants';
import { Coordinates } from './../../../../common/coordinates/coordinates';
import { Match, MatchType, State } from './../../../../common/match/match';
import { Objective, ObjectiveType } from './../../../../common/objective/objective';
import { Parameters, VirtualPlayerDifficulty } from './../../../../common/parameters/parameters';
import { Player } from './../../../../common/player/player';
import { PotentialWord } from './../../../../common/potential-word/potential-word';
import { VirtualPlayerLevel, VirtualPlayerName } from './../../../../common/virtual-player-name/virtual-player-name';
import { VirtualPlayersCollection } from './../database-services/virtual-players-collection-service/virtual-players-collection.service';
import { ObjectivesService } from './../objectives-service/objectives.service';

@Service()
export class InitializationService {
    virtualPlayerBeginnerNames: VirtualPlayerName[];
    virtualPlayerExpertNames: VirtualPlayerName[];

    constructor(private virtualPlayersCollection: VirtualPlayersCollection, private objectiveService: ObjectivesService) {
        this.getVirtualPlayerNames();
        this.virtualPlayerBeginnerNames = BEGINNER_VIRTUAL_PLAYERS;
        this.virtualPlayerExpertNames = EXPERT_VIRTUAL_PLAYERS;
    }

    async getVirtualPlayerNames(): Promise<void> {
        const virtualPlayerExpertsNamesList = await this.virtualPlayersCollection.getAllVirtualPlayersNames(VirtualPlayerLevel.Expert);
        const virtualPlayerBeginnersNamesList = await this.virtualPlayersCollection.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        const isVirtualPlayerExpertsNamesListFull =
            virtualPlayerExpertsNamesList !== [] && virtualPlayerExpertsNamesList !== undefined && virtualPlayerExpertsNamesList[0] !== undefined;
        const isVirtualPlayerBeginnersNamesListFull =
            virtualPlayerBeginnersNamesList !== [] &&
            virtualPlayerBeginnersNamesList !== undefined &&
            virtualPlayerBeginnersNamesList[0] !== undefined;
        this.virtualPlayerExpertNames = isVirtualPlayerExpertsNamesListFull ? virtualPlayerExpertsNamesList : EXPERT_VIRTUAL_PLAYERS;
        this.virtualPlayerBeginnerNames = isVirtualPlayerBeginnersNamesListFull ? virtualPlayerBeginnersNamesList : BEGINNER_VIRTUAL_PLAYERS;
    }

    getVirtualPlayerName(difficulty: VirtualPlayerDifficulty): VirtualPlayerName {
        return difficulty === VirtualPlayerDifficulty.Beginner
            ? this.virtualPlayerBeginnerNames[Math.floor(Math.random() * this.virtualPlayerBeginnerNames.length)]
            : this.virtualPlayerExpertNames[Math.floor(Math.random() * this.virtualPlayerExpertNames.length)];
    }

    initializeMatch(parameters: Parameters): Match {
        const initialParameters: Parameters = parameters;

        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };

        const match: Match = {
            players: new Array<Player>(),
            activePlayer: this.pickFirstPlayer(),
            parameters: initialParameters,
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
            name: match.parameters.creatorName,
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };

        const player2: Player = {
            tray: [],
            name: this.setVirtualOpponentName(player1.name, parameters.difficulty),
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };

        match.players = [player1, player2];
        return match;
    }

    initializeVirtualPlayer(playerName: string, leavingPlayer: Player, difficulty: VirtualPlayerDifficulty): Player {
        return {
            tray: leavingPlayer.tray,
            name: this.setVirtualOpponentName(playerName, difficulty),
            score: leavingPlayer.score,
            socketId: '',
            roomId: leavingPlayer.roomId,
            gameType: 0,
            debugOn: false,
            chatHistory: leavingPlayer.chatHistory,
            privateOvjective: leavingPlayer.privateOvjective,
        };
    }

    initializeObjectives(isPublicObjective: boolean): Objective[] {
        return isPublicObjective ? this.objectiveService.pickObjectives(2, true) : this.objectiveService.pickObjectives(1, false);
    }

    initializeBoard(boardConfig: string): Box[][] {
        const board: Box[][] = new Array<Box[]>(MAX_ROW);
        for (let i = 0; i < MAX_ROW; i++) {
            board[i] = new Array<Box>(MAX_ROW);
            for (let j = 0; j < MAX_COLUMN; j++) {
                const box: Box = { letter: '', boxType: this.getBoxType('-'), coordinates: { row: i, column: j } };
                board[i][j] = box;
            }
        }

        for (let i = 0; i < MAX_ROW; i++) {
            for (let j = 0; j < MAX_ROW; j++) {
                const boardCoordinates: Coordinates = {
                    row: i,
                    column: j,
                };
                const box: Box = {
                    letter: '',
                    boxType: this.getBoxType(boardConfig[j + i * MAX_ROW]),
                    coordinates: boardCoordinates,
                };

                board[i][j] = box;
            }
        }
        return board;
    }

    applyRandomBonus(): string {
        const boardConfig: string[] = [];

        const bonusCounter = this.initializeBonusCounter();
        let boxTypes = Array.from(bonusCounter.keys());

        for (const boxConfigType of BOARD_CONFIGURATION.split('')) {
            if (boxConfigType !== '-' && boxConfigType !== '*') {
                boxTypes = boxTypes.filter((boxType) => (bonusCounter.get(boxType) as number) > 0);
                const chosenBoxType: string = boxTypes[Math.floor(Math.random() * boxTypes.length)] as string;
                let chosenBoxTypeCount: number = bonusCounter.get(chosenBoxType) as number;

                boardConfig.push(chosenBoxType);

                bonusCounter.set(chosenBoxType, --chosenBoxTypeCount);
            } else {
                boardConfig.push(boxConfigType);
            }
        }

        return boardConfig.join('');
    }

    initializeBonusCounter(): Map<string, number> {
        const bonusCounter: Map<string, number> = new Map<string, number>();
        bonusCounter.set('t', TWELVE);
        bonusCounter.set('T', EIGHT);
        bonusCounter.set('d', TWENTY_FOUR);
        bonusCounter.set('D', SIXTEEN);

        return bonusCounter;
    }

    getBoxType(boxConfiguration: string): BoxType {
        const boxType: BoxType = {
            type: ScoreType.Letter,
            value: ScoreCoefficient.Normal,
        };
        switch (boxConfiguration) {
            case '-':
                boxType.type = ScoreType.Letter;
                boxType.value = ScoreCoefficient.Normal;
                break;
            case 'D':
                boxType.type = ScoreType.Word;
                boxType.value = ScoreCoefficient.Double;
                break;
            case 'T':
                boxType.type = ScoreType.Word;
                boxType.value = ScoreCoefficient.Triple;
                break;
            case 'd':
                boxType.type = ScoreType.Letter;
                boxType.value = ScoreCoefficient.Double;
                break;
            case 't':
                boxType.type = ScoreType.Letter;
                boxType.value = ScoreCoefficient.Triple;
                break;
            case '*':
                boxType.type = ScoreType.Word;
                boxType.value = ScoreCoefficient.Triple;
                break;
        }
        return boxType;
    }

    setVirtualOpponentName(realPlayerName: string, difficulty: VirtualPlayerDifficulty): string {
        let virtualPlayerName: string = this.getVirtualPlayerName(difficulty).name;
        let tryCount = 0;
        let isVirtualPlayerNameDuplicated = realPlayerName === virtualPlayerName;

        while (isVirtualPlayerNameDuplicated) {
            virtualPlayerName = this.getVirtualPlayerName(difficulty).name;
            tryCount++;
            isVirtualPlayerNameDuplicated = realPlayerName === virtualPlayerName && tryCount < MAX_TRY_COUNT;
        }
        return virtualPlayerName;
    }

    pickFirstPlayer(): number {
        return Math.round(Math.random());
    }
}
