import { ChatBoxService } from '@app/services/chat-box-service/chat-box.service';
import { CommandService } from '@app/services/command-service/command.service';
import { DebugService } from '@app/services/debug-service/debug.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { ValidationService } from '@app/services/validation-service/validation.service';
import { PotentialWord } from '@common/potential-word/potential-word';
import { Service } from 'typedi';
import { Box } from './../../../../common/box/box';
import { ChatAuthor } from './../../../../common/chat/chat';
import {
    DIRECTION_PROBABILITY,
    EXCHANGE_PROBABILITY,
    INDEX_INITIALIZATION,
    INDEX_UNDEFINED,
    LETTER_INDEX,
    LOWER_CASE_A_ASCII,
    MAX_COLUMN,
    MAX_ROW,
    ONE_SECOND_IN_MILLISECONDS,
    PLACE_PROBABILITY,
    ROOM_INITIALIZATION,
    THREE_SECONDS,
    TRAY_SIZE,
    WORD_LENGTH_FOURTEEN,
} from './../../../../common/constants/constants';
import { Coordinates } from './../../../../common/coordinates/coordinates';
import { NewLetterToPlace } from './../../../../common/new-letter-to-place/new-letter-to-place';
import { Objective, ObjectiveType } from './../../../../common/objective/objective';
import { VirtualPlayerDifficulty } from './../../../../common/parameters/parameters';
import { Player } from './../../../../common/player/player';
import { WordOnBoard } from './../../../../common/word-placement/word-placement';

@Service()
export class VirtualPlayerService {
    player: Player;
    tray: string[];
    private commandChoiceProbability: number;
    constructor(
        protected gameModeService: GameModeService,
        protected commandService: CommandService,
        protected validationService: ValidationService,
        protected chatBoxService: ChatBoxService,
        protected debugService: DebugService,
    ) {
        this.tray = [];
        const initialObjective: Objective = {
            index: INDEX_INITIALIZATION,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: ROOM_INITIALIZATION,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        this.commandChoiceProbability = Math.random();
    }

    getPotentialWordsFromDictionary(rowIndex: number, wordOnBoard: WordOnBoard): string[] {
        const maxPrefixLength: number = this.gameModeService.findPrefixMaxLength(rowIndex, wordOnBoard.startPosition);
        const maxSuffixLength: number = this.gameModeService.findSuffixMaxLength(rowIndex, wordOnBoard);

        const potentialWordRegexString: string =
            '^[' +
            this.tray.join('') +
            ']{0,' +
            Math.min(maxPrefixLength, TRAY_SIZE) +
            '}' +
            wordOnBoard.word +
            '[' +
            this.tray.join('') +
            ']{0,' +
            Math.min(maxSuffixLength, TRAY_SIZE) +
            '}' +
            '$';
        const potentialWordFormat = new RegExp(potentialWordRegexString);

        let results: string[] = this.validationService.getWordMatches(potentialWordFormat);

        results = results.filter((word) => word.length <= WORD_LENGTH_FOURTEEN);
        results = results.filter((word) =>
            this.isWordValidFromTray(this.gameModeService.match.players[1].tray.join(wordOnBoard.word).split(''), word),
        );
        return results;
    }

    isWordValidFromTray(tray: string[], possibleword: string) {
        const attemptedWordSplitted = possibleword.split('');
        return attemptedWordSplitted.every((attemptedLetter) => {
            const letterIndex = tray.indexOf(attemptedLetter);
            if (letterIndex > LETTER_INDEX) {
                tray.splice(letterIndex, 1);
                return true;
            } else {
                return false;
            }
        });
    }

    isWordAlreadyPlacedInSamePositionOnBoard(potentialWord: string, wordOnBoard: WordOnBoard, rowIndex: number): boolean {
        for (let i = rowIndex; i < Math.min(MAX_ROW, rowIndex + potentialWord.length); i++) {
            const isSameWordNotInBoard = !(this.gameModeService.board[i][wordOnBoard.startPosition].letter === potentialWord[i - rowIndex]);
            if (isSameWordNotInBoard) return false;
        }
        return true;
    }

    isPotentialWordCreatedByTray(potentialWord: string, wordOnBoard: WordOnBoard): boolean {
        const wordFormat = new RegExp('[' + potentialWord + wordOnBoard.word + ']');
        return wordFormat.test(this.tray.join(''));
    }

    isPotentialWordValid(wordOnBoard: WordOnBoard, rowIndex: number, potentialWord: string): boolean {
        if (!this.isPotentialWordCreatedByTray(potentialWord, wordOnBoard)) return false;
        const indexOfWordOnBoardInPotentialWord: number = potentialWord.indexOf(wordOnBoard.word, 0);
        let startPositionOnBoardOfPotentialWord: number =
            Math.max(indexOfWordOnBoardInPotentialWord, wordOnBoard.startPosition) -
            Math.min(indexOfWordOnBoardInPotentialWord, wordOnBoard.startPosition);
        if (indexOfWordOnBoardInPotentialWord === 0) startPositionOnBoardOfPotentialWord = wordOnBoard.startPosition;
        for (
            let i: number = startPositionOnBoardOfPotentialWord;
            i < Math.min(startPositionOnBoardOfPotentialWord + potentialWord.length, MAX_COLUMN);
            i++
        ) {
            const isTileIsOccupied: boolean = this.gameModeService.board[rowIndex][i].letter !== '';
            const isLetterOnBoardIsSameAsLetterInWord: boolean =
                this.gameModeService.board[rowIndex][i].letter === potentialWord[i - startPositionOnBoardOfPotentialWord];

            const newLetterToPlace: NewLetterToPlace = {
                board: this.gameModeService.board,
                letter: potentialWord[i - startPositionOnBoardOfPotentialWord],
                rowIndex,
                columnIndex: i,
            };

            const isLetterOnColumnValid: boolean = this.validationService.isCrossCheckOnColumnValid(newLetterToPlace);
            const isPotentialWordNotPossible = !((!isTileIsOccupied || isLetterOnBoardIsSameAsLetterInWord) && isLetterOnColumnValid);
            if (isPotentialWordNotPossible) return false;
        }
        if (this.isWordAlreadyPlacedInSamePositionOnBoard(potentialWord, wordOnBoard, rowIndex)) {
            return false;
        }
        return this.validationService.isPotentialWordPlacedOnRowInDictionary(potentialWord, wordOnBoard, rowIndex, this.gameModeService.board);
    }

    getPotentialWordsForRow(rowIndex: number, wordOnBoard: WordOnBoard): PotentialWord[] {
        const results: string[] = this.getPotentialWordsFromDictionary(rowIndex, wordOnBoard);

        for (let i: number = results.length - 1; i >= 0; i--) {
            const isPotentialWordNotValid = !this.isPotentialWordValid(wordOnBoard, rowIndex, results[i]);
            if (isPotentialWordNotValid) {
                results.splice(results.indexOf(results[i], 0), 1);
            }
        }

        const potentialWordsResult: PotentialWord[] = Array<PotentialWord>();
        for (const wordResult of results) {
            const coordinates: Coordinates = {
                row: rowIndex,
                column: wordOnBoard.startPosition - wordResult.indexOf(wordOnBoard.word, 0),
            };
            const potentialWord: PotentialWord = {
                word: wordResult,
                score: 0,
                startPosition: coordinates,
            };
            const isWordNotOnBoard = !this.validationService.isWordAlreadyOnBoard(potentialWord);
            if (isWordNotOnBoard) potentialWordsResult.push(potentialWord);
        }

        return potentialWordsResult;
    }

    getPotentialWordsForBoard(direction: string): PotentialWord[] {
        const board: Box[][] = this.gameModeService.board;
        let potentialWordsOnBoard: PotentialWord[] = Array<PotentialWord>();

        if (direction === 'v') this.gameModeService.board = this.validationService.transposeBoard(this.gameModeService.board);

        for (let i = 0; i < board.length; i++) {
            const wordOnBoard: WordOnBoard = this.validationService.getWordOnBoard(i, this.gameModeService.board);

            if (wordOnBoard.word) {
                const potentialWordsOnRow: PotentialWord[] = this.getPotentialWordsForRow(i, wordOnBoard);
                potentialWordsOnBoard = potentialWordsOnBoard.concat(this.validationService.generateScoreForPotentialWords(potentialWordsOnRow));
            }
        }

        this.gameModeService.board = direction === 'v' ? board : this.gameModeService.board;
        return potentialWordsOnBoard.sort((potentialWord1, potentialWord2) => {
            if (potentialWord1.score > potentialWord2.score) return 1;
            if (potentialWord1.score < potentialWord2.score) return INDEX_UNDEFINED;
            return 0;
        });
    }

    getCommandAction(difficulty: VirtualPlayerDifficulty): string {
        this.commandChoiceProbability = Math.random();
        return difficulty === VirtualPlayerDifficulty.Beginner ? this.beginnerVirtualPlayerCommandAction() : this.expertVirtualPlayerCommandAction();
    }

    runCommandActionVirtualPlayer(): void {
        const command: string = this.getCommandAction(this.gameModeService.match.parameters.difficulty);
        setTimeout(() => {
            this.commandService.handleCommand(command, this.player);
            this.chatBoxService.addChat({ message: this.gameModeService.match.players[1].name + ':' + command, author: ChatAuthor.Opponent });
        }, THREE_SECONDS * ONE_SECOND_IN_MILLISECONDS);
    }

    placeFirstTurn(): void {
        let check = '^[';
        for (const letter of this.tray) {
            check = check.concat(letter + ']{0,1}[');
        }
        check = check.replace('[*]', '[a-z]');
        check = check.substr(0, check.length - 1);
        check = check.concat('$');

        const wordFormat = new RegExp(check);
        const wordResults: string[] = this.validationService.getWordMatches(wordFormat);
        let chosenWord = '';
        const potentialWords: PotentialWord[] = [];

        let commandAction = '';
        if (wordResults.length > 0) {
            chosenWord = wordResults[0];
            for (let i = 0; i < wordResults.length && i < 3; i++) {
                potentialWords.push({ word: wordResults[i], score: 0, startPosition: { row: 7, column: 7 } });
            }
            commandAction = '!placer h8h ' + chosenWord;
            const debugMessage = this.debugService.createDebugMessage('h', potentialWords);

            this.gameModeService.match.wordsOnBoard.push(potentialWords[0]);
            if (this.gameModeService.match.players[0].debugOn) this.chatBoxService.addChat({ message: debugMessage, author: ChatAuthor.System });
        } else {
            commandAction = '!échanger ' + this.tray.join('');
        }

        setTimeout(() => {
            if (commandAction.includes('!placer')) {
                const lettersToDeleteFromTray = [];
                let columnIndex = 7;
                for (const letter of chosenWord) {
                    this.gameModeService.board[7][columnIndex].letter = letter;
                    columnIndex++;
                    lettersToDeleteFromTray.push(letter);
                }

                for (let i = lettersToDeleteFromTray.length - 1; i >= 0; i--) {
                    const letterToDelete = lettersToDeleteFromTray[i];
                    this.gameModeService.match.players[1].tray.splice(this.gameModeService.match.players[1].tray.indexOf(letterToDelete), 1);
                }

                this.gameModeService.match.players[1].tray = this.gameModeService.match.players[1].tray.concat(
                    this.gameModeService.bank.draw(lettersToDeleteFromTray.length),
                );
                this.gameModeService.match.players[1].score += this.validationService.calculateScoreOfTurn({
                    row: 7,
                    column: 7,
                    direction: 'h',
                    word: chosenWord,
                });
            } else {
                this.commandService.handleCommand(commandAction, this.player);
                commandAction = this.gameModeService.match.players[1].name + ':' + commandAction;
            }
            this.chatBoxService.addChat({ message: commandAction, author: ChatAuthor.Opponent });
        }, THREE_SECONDS * ONE_SECOND_IN_MILLISECONDS);
    }

    private expertVirtualPlayerCommandAction(): string {
        let commandMessage = '';
        let direction = 'h';
        if (Math.random() > DIRECTION_PROBABILITY) direction = 'v';
        const potentialWords: PotentialWord[] = this.getPotentialWordsForBoard(direction);

        if (potentialWords.length === 0) {
            if (this.gameModeService.bank.getReserveNumber() === 0) {
                commandMessage = '!passer';
                return commandMessage;
            } else {
                commandMessage = '!échanger ';
                commandMessage +=
                    this.gameModeService.bank.getReserveNumber() <
                    this.gameModeService.match.players[this.gameModeService.match.activePlayer].tray.length
                        ? this.gameModeService.pickRandomLetters(this.gameModeService.bank.getReserveNumber())
                        : this.gameModeService.match.players[this.gameModeService.match.activePlayer].tray.join('');
            }
        } else {
            const chosenWord: PotentialWord = potentialWords[potentialWords.length - 1];
            const debugMessage = this.debugService.createDebugMessage(direction, potentialWords);
            if (this.gameModeService.match.players[0].debugOn) this.chatBoxService.addChat({ message: debugMessage, author: ChatAuthor.System });
            let locationOnBoard = '';
            locationOnBoard =
                direction === 'v'
                    ? String.fromCharCode(LOWER_CASE_A_ASCII + chosenWord.startPosition.column) + (chosenWord.startPosition.row + 1).toString() + 'v '
                    : String.fromCharCode(LOWER_CASE_A_ASCII + chosenWord.startPosition.row) +
                      (chosenWord.startPosition.column + 1).toString() +
                      'h ';

            commandMessage += '!placer ' + locationOnBoard + chosenWord.word;
            this.gameModeService.match.wordsOnBoard.push(chosenWord);
        }
        return commandMessage;
    }

    private beginnerVirtualPlayerCommandAction(): string {
        let commandMessage = '';
        if (this.commandChoiceProbability <= PLACE_PROBABILITY) {
            const direction = Math.random() > DIRECTION_PROBABILITY ? 'v' : 'h';
            const potentialWords: PotentialWord[] = this.getPotentialWordsForBoard(direction);
            if (potentialWords.length === 0) {
                commandMessage += '!échanger ' + this.gameModeService.match.players[1].tray.join('');
                return commandMessage;
            }
            const chosenWord: PotentialWord = potentialWords[0];
            const debugMessage = this.debugService.createDebugMessage(direction, potentialWords);
            if (this.gameModeService.match.players[0].debugOn) this.chatBoxService.addChat({ message: debugMessage, author: ChatAuthor.System });

            const locationOnBoard =
                direction === 'v'
                    ? String.fromCharCode(LOWER_CASE_A_ASCII + chosenWord.startPosition.column) + (chosenWord.startPosition.row + 1).toString() + 'v '
                    : String.fromCharCode(LOWER_CASE_A_ASCII + chosenWord.startPosition.row) +
                      (chosenWord.startPosition.column + 1).toString() +
                      'h ';

            commandMessage += '!placer ' + locationOnBoard + chosenWord.word;
            this.gameModeService.match.wordsOnBoard.push(chosenWord);
        } else {
            if (this.commandChoiceProbability > PLACE_PROBABILITY && this.commandChoiceProbability <= EXCHANGE_PROBABILITY) {
                commandMessage += '!échanger ' + this.gameModeService.match.players[1].tray.join('');
            } else {
                commandMessage += '!passer';
            }
        }
        return commandMessage;
    }
}
