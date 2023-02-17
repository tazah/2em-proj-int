import { Injectable } from '@angular/core';
import { Box, BoxType, ScoreCoefficient, ScoreType } from '@common/box/box';
import { Chat, ChatAuthor } from '@common/chat/chat';
import { BOARD_CONFIGURATION, LetterTileType, MAX_COLUMN, MAX_ROW } from '@common/constants/constants';
import { Coordinates } from '@common/coordinates/coordinates';
import { LetterTile } from '@common/letter-tile/letter-tile';
import { Match, MatchType, State } from '@common/match/match';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import { Player } from '@common/player/player';
import { PotentialWord } from '@common/potential-word/potential-word';

@Injectable({
    providedIn: 'root',
})
export class LocalGameHandlerService {
    board: Box[][];
    match: Match;
    player: Player;
    bank: Map<string, LetterTile>;
    chatHistory: Chat[];
    isSecondPlayer: boolean;
    isRandomBoxTypes: boolean;
    maxTimer: number;
    initialParameters: Parameters;

    constructor() {
        this.bank = new Map<string, LetterTile>();
        this.isRandomBoxTypes = false;
        this.maxTimer = 60;
        this.initialParameters = {
            dictionary: 'dictionary1',
            timer: 60,
            creatorName: '',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.match = {
            players: new Array<Player>(2),
            activePlayer: 0,
            parameters: this.initialParameters,
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
        const player2: Player = {
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
        this.match.players = [player1, player2];
        this.player = player1;
        this.board = this.initializeBoard();
        this.chatHistory = [];
        this.isSecondPlayer = false;
    }

    resetLocalGame() {
        this.isRandomBoxTypes = false;
        this.maxTimer = 60;
        this.initialParameters = {
            dictionary: 'dictionary1',
            timer: 60,
            creatorName: '',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.match = {
            players: new Array<Player>(2),
            activePlayer: 0,
            parameters: this.initialParameters,
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
        const player2: Player = {
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
        this.match.players = [player1, player2];
        this.player = player1;
        this.board = this.initializeBoard();
        this.chatHistory = [];
        this.isSecondPlayer = false;
    }

    swapPlayers(): void {
        const tempPlayer = this.match.players[0];
        this.match.players[0] = this.match.players[1];
        this.match.players[1] = tempPlayer;
        this.match.activePlayer = 1 - this.match.activePlayer;
        this.swapChat();
    }

    swapChat(): void {
        for (const chat of this.chatHistory) {
            if (chat.author === ChatAuthor.Player) chat.author = ChatAuthor.Opponent;
            else if (chat.author === ChatAuthor.Opponent) chat.author = ChatAuthor.Player;
        }
    }

    getReserveNumber(): number {
        let sum = 0;
        for (const tile of this.bank.values()) sum += tile.quantity;
        return sum;
    }

    initializeBoard(): Box[][] {
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
                    boxType: this.getBoxType(BOARD_CONFIGURATION[j + i * MAX_ROW]),
                    coordinates: boardCoordinates,
                };
                board[i][j] = box;
            }
        }
        return board;
    }

    getBoxType(boxConfiguration: string): BoxType {
        const boxType: BoxType = {
            type: ScoreType.Letter,
            value: ScoreCoefficient.Normal,
        };
        switch (boxConfiguration) {
            case LetterTileType.NORMAL:
                boxType.type = ScoreType.Letter;
                boxType.value = ScoreCoefficient.Normal;
                break;
            case LetterTileType.DOUBLE_WORD:
                boxType.type = ScoreType.Word;
                boxType.value = ScoreCoefficient.Double;
                break;
            case LetterTileType.TRIPLE_wORD:
                boxType.type = ScoreType.Word;
                boxType.value = ScoreCoefficient.Triple;
                break;
            case LetterTileType.DOUBLE_LETTER:
                boxType.type = ScoreType.Letter;
                boxType.value = ScoreCoefficient.Double;
                break;
            case LetterTileType.TRIPLE_LETTER:
                boxType.type = ScoreType.Letter;
                boxType.value = ScoreCoefficient.Triple;
                break;
            case LetterTileType.STAR:
                boxType.type = ScoreType.Word;
                boxType.value = ScoreCoefficient.Triple;
                break;
        }
        return boxType;
    }
}
