import { BankService } from '@app/services/bank-service/bank.service';
import { Service } from 'typedi';
import { Box } from './../../../../common/box/box';
import { Chat, ChatAuthor } from './../../../../common/chat/chat';
import { BOARD_CONFIGURATION, MAX_ROW, MAX_ROW_INDEX, PASSES_TO_END_GAME, TRAY_SIZE } from './../../../../common/constants/constants';
import { Match, MatchType, State } from './../../../../common/match/match';
import { Objective, ObjectiveType } from './../../../../common/objective/objective';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from './../../../../common/parameters/parameters';
import { Player } from './../../../../common/player/player';
import { PotentialWord } from './../../../../common/potential-word/potential-word';
import { WordOnBoard } from './../../../../common/word-placement/word-placement';
import { InitializationService } from './../initialization-service/initialization.service';

@Service()
export class GameModeService {
    match: Match;
    board: Box[][];
    isBoxTypeRandom: boolean;

    constructor(public bank: BankService, public initializationService: InitializationService) {
        this.isBoxTypeRandom = false;
        this.board = new Array<Box[]>(MAX_ROW);

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
            parameters: {
                dictionary: 'dictionary1',
                timer: 60,
                creatorName: '',
                isBoxTypeRandom: false,
                mode: GameModeType.classic,
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

        this.initializeGame({
            difficulty: VirtualPlayerDifficulty.Beginner,
            mode: GameModeType.classic,
            isBoxTypeRandom: false,
            timer: 60,
            creatorName: '',
            dictionary: 'dictionary1',
        });
    }

    initializeGame(initialParameters: Parameters): void {
        this.match.parameters = initialParameters;
        this.match = this.initializationService.initializeMatch(initialParameters);
        this.match.boardConfiguration = initialParameters.isBoxTypeRandom ? this.initializationService.applyRandomBonus() : BOARD_CONFIGURATION;
        this.board = this.initializationService.initializeBoard(this.match.boardConfiguration);
        this.bank.initializeBank();
        this.fillTrayTurn();
    }

    fillTrayTurn(): void {
        this.match.players[this.match.activePlayer].tray = this.match.players[this.match.activePlayer].tray.concat(
            this.bank.draw(TRAY_SIZE - this.match.players[this.match.activePlayer].tray.length),
        );
        this.match.players[1 - this.match.activePlayer].tray = this.match.players[1 - this.match.activePlayer].tray.concat(
            this.bank.draw(TRAY_SIZE - this.match.players[1 - this.match.activePlayer].tray.length),
        );
    }

    checkEndOfGame(): boolean {
        const isConsecutiveTotalPasses: boolean = this.match.numberOfConsecutivePasses >= 3 && this.match.numberOfTotalPasses >= PASSES_TO_END_GAME;

        for (let i = 0; i < this.match.players.length; i++) {
            if (this.bank.getReserveNumber() === 0) {
                this.match.gameOver = true;
                this.match.winner = i;
                this.match.players[i].score += this.getTrayScore(1 - i);
                this.match.players[1 - i].score -= this.getTrayScore(1 - i);
                return this.match.gameOver;
            }
        }

        if (isConsecutiveTotalPasses) {
            this.match.gameOver = true;
            for (let i = 0; i < this.match.players.length; i++) this.match.players[i].score -= this.getTrayScore(i);
            if (this.match.players[0].score > this.match.players[1].score) this.match.winner = 0;
            else this.match.winner = 1;
        }
        return this.match.gameOver;
    }

    getTrayScore(player: number): number {
        let sumScore = 0;
        for (const tile of this.match.players[player].tray) {
            sumScore += this.bank.getWeight(tile);
        }
        return sumScore;
    }

    getPlayerIndex(playerName: string): number {
        return this.match.players[0].name === playerName ? 0 : 1;
    }

    pickRandomLetters(numberToPick: number): string {
        let pickedLetters = '';
        for (let letter = 0; letter <= numberToPick; letter++) {
            pickedLetters += this.match.players[this.match.activePlayer].tray[Math.floor(Math.random() * this.match.players[1].tray.length)];
        }
        return pickedLetters;
    }

    findPrefixMaxLength(rowIndex: number, startPosition: number): number {
        if (startPosition === 0) return startPosition;
        let indexBox = startPosition - 1;
        let prefixLength = 0;
        while (indexBox >= 0 && this.board[rowIndex][indexBox].letter === '') {
            indexBox--;
            prefixLength++;
        }
        return prefixLength;
    }

    findSuffixMaxLength(rowIndex: number, wordPlacement: WordOnBoard): number {
        let indexBox: number = wordPlacement.startPosition + wordPlacement.word.length;

        let suffixLength = 0;
        while (indexBox <= MAX_ROW_INDEX && this.board[rowIndex][indexBox].letter === '') {
            indexBox++;
            suffixLength++;
        }
        return suffixLength;
    }

    getIndexOfCurrentPlayer(currentPlayer: Player): number {
        let indexOfCurrentPlayer = -1;
        for (const player of this.match.players) {
            if (player.name === currentPlayer.name) {
                indexOfCurrentPlayer = this.match.players.indexOf(player);
                break;
            }
        }
        return indexOfCurrentPlayer;
    }

    updateMatchForAbandonGame(opponentPlayer: Player, leavingPlayer: Player, difficulty: VirtualPlayerDifficulty): void {
        this.match.players[0] = opponentPlayer;
        this.match.players[1] = this.initializationService.initializeVirtualPlayer(opponentPlayer.name, leavingPlayer, difficulty);
        this.match.activePlayer = 0;

        this.match.players[0].chatHistory.push({
            author: ChatAuthor.System,
            message: 'votre adversaire a abandonne la partie, il est remplace par un joueur virtuel débutant, bonne chance!',
        });
    }

    setCreatorPlayerInfo(creatorPlayer: Player, roomId: number, socketId: string): void {
        this.match.publicObjectives = this.initializationService.initializeObjectives(true);
        this.match.players[0] = creatorPlayer;
        this.match.players[0].privateOvjective = this.initializationService.initializeObjectives(false)[0];
        this.match.players[0].roomId = roomId;
        this.match.players[0].socketId = socketId;
    }

    setObjectives(isBoxTypeRandom: boolean): void {
        this.isBoxTypeRandom = isBoxTypeRandom;
        this.match.publicObjectives = this.initializationService.initializeObjectives(true);
        this.match.players[0].privateOvjective = this.initializationService.initializeObjectives(false)[0];
        this.match.players[1].privateOvjective = this.initializationService.initializeObjectives(false)[0];
    }

    setSoloModePlayerInfo(player: Player, roomID: number): void {
        this.match.players[0].name = player.name;
        this.match.players[0].socketId = player.socketId;
        this.match.players[0].roomId = roomID;
        this.match.players[1].roomId = roomID;
    }

    initializeMultiPlayerModeMatch(player: Player): void {
        this.match.type = MatchType.Multiplayer;
        this.match.players[1] = player;
        this.match.players[1].privateOvjective = this.initializationService.initializeObjectives(false)[0];
        this.bank.initializeBank();
        this.fillTrayTurn();
    }

    updateChatHistory(commandOutput: Chat, indexOfPlayer: number): void {
        if (this.match.type === MatchType.Solo) this.match.players[0].chatHistory.push(commandOutput);
        else this.match.players[indexOfPlayer].chatHistory.push(commandOutput);
    }

    updateChatHistoryForAllParticipants(commandOutput: Chat): void {
        this.match.players[0].chatHistory.push(commandOutput);
        if (this.match.type === MatchType.Multiplayer) this.match.players[1].chatHistory.push(commandOutput);
    }
}
