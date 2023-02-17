import { Box } from '@app/../../common/box/box';
import { BONUS_ALL_LETTERS_OF_TRAY, CommandStatus, INDEX_MIDDLE_CASE, MAX_COLUMN_INDEX, MAX_ROW_INDEX } from '@app/../../common/constants/constants';
import { PotentialWord } from '@app/../../common/potential-word/potential-word';
import { WordOnBoard } from '@app/../../common/word-placement/word-placement';
import { PlaceCommandParameters } from '@app/classes/place-command-parameters/place-command-parameters';
import { DictionnaryService } from '@app/services/dictionnary-service/dictionnary.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { ScoreService } from '@app/services/score-service/score.service';
import { Service } from 'typedi';
import { MatchType } from './../../../../common/match/match';
import { NewLetterToPlace } from './../../../../common/new-letter-to-place/new-letter-to-place';
@Service()
export class ValidationService {
    constructor(private gameModeService: GameModeService, private dictionaryService: DictionnaryService, private scoreService: ScoreService) {}

    getVerticalWordAbove(rowIndex: number, columnIndex: number, board: Box[][]): string {
        if (rowIndex === 0) return '';
        let word = '';
        let indexOfRow: number = rowIndex - 1;
        while (indexOfRow >= 0 && board[indexOfRow][columnIndex].letter !== '' && indexOfRow < rowIndex) {
            word = word.concat(board[indexOfRow][columnIndex].letter);
            indexOfRow--;
        }

        return word;
    }

    getVerticalWordBelow(rowIndex: number, columnIndex: number, board: Box[][]): string {
        if (rowIndex === MAX_ROW_INDEX) return '';
        let word = '';
        let indexOfRow: number = rowIndex + 1;
        while (indexOfRow <= MAX_ROW_INDEX && board[indexOfRow][columnIndex].letter !== '') {
            word = word.concat(board[indexOfRow][columnIndex].letter);
            indexOfRow++;
        }
        return word;
    }

    isCrossCheckOnColumnValid(newLetterToPlace: NewLetterToPlace): boolean {
        const wordAbove: string = this.getVerticalWordAbove(newLetterToPlace.rowIndex, newLetterToPlace.columnIndex, newLetterToPlace.board)
            .split('')
            .reverse()
            .join('');
        const wordBelow: string = this.getVerticalWordBelow(newLetterToPlace.rowIndex, newLetterToPlace.columnIndex, newLetterToPlace.board);
        const verticalWord: string = wordAbove + newLetterToPlace.letter + wordBelow;
        if (verticalWord.length === 1) return true;

        return this.dictionaryService.trie.search(wordAbove + newLetterToPlace.letter + wordBelow);
    }

    getImpactedWords(columnIndex: number, rowIndex: number, word: string): string[] {
        const impactedWords = new Array<string>();
        for (const letter of word) {
            const wordAbove: string = this.getVerticalWordAbove(rowIndex, columnIndex, this.gameModeService.board).split('').reverse().join('');
            const wordBelow: string = this.getVerticalWordBelow(rowIndex, columnIndex, this.gameModeService.board);
            const verticalWord: string = wordAbove + letter + wordBelow;
            columnIndex = Math.min(columnIndex + 1, MAX_COLUMN_INDEX);
            impactedWords.push(verticalWord);
        }
        return impactedWords;
    }

    getHorizontalWordOnRight(columnIndex: number, rowIndex: number, board: Box[][]): string {
        let indexOfColumn: number = columnIndex + 1;
        let word = '';
        while (indexOfColumn <= MAX_COLUMN_INDEX && board[rowIndex][indexOfColumn].letter !== '') {
            word = word.concat(board[rowIndex][indexOfColumn].letter);
            indexOfColumn++;
        }
        return word;
    }

    getHorizontalWordOnLeft(columnIndex: number, rowIndex: number, board: Box[][]): string {
        let indexOfColumn: number = columnIndex - 1;
        let word = '';
        while (indexOfColumn >= 0 && board[rowIndex][indexOfColumn].letter !== '') {
            word = word.concat(board[rowIndex][indexOfColumn].letter);
            indexOfColumn--;
        }
        return word;
    }

    isPotentialWordPlacedOnRowInDictionary(potentialWord: string, wordOnBoard: WordOnBoard, rowIndex: number, board: Box[][]): boolean {
        const maxPrefixLength: number = potentialWord.indexOf(wordOnBoard.word);
        let prefixWord = '';
        let suffixWord = '';
        const indexOfWordOnBoardInPotentialWord: number = potentialWord.indexOf(wordOnBoard.word, 0);
        const startPositionOnBoardOfPotentialWord: number =
            Math.max(indexOfWordOnBoardInPotentialWord, wordOnBoard.startPosition) -
            Math.min(indexOfWordOnBoardInPotentialWord, wordOnBoard.startPosition);
        const wordStartPosition: number = wordOnBoard.startPosition - maxPrefixLength - 1;
        const wordEndPosition: number = wordOnBoard.startPosition - potentialWord.indexOf(wordOnBoard.word) + potentialWord.length;
        if (wordStartPosition > 0) {
            prefixWord = this.getHorizontalWordOnLeft(Math.min(wordOnBoard.startPosition, startPositionOnBoardOfPotentialWord), rowIndex, board);
        }

        if (wordEndPosition < MAX_ROW_INDEX) {
            suffixWord = this.getHorizontalWordOnRight(startPositionOnBoardOfPotentialWord + potentialWord.length, rowIndex, board);
        }
        return this.dictionaryService.trie.search(prefixWord + potentialWord + suffixWord);
    }

    getWordMatches(potentialWordFormat: RegExp): string[] {
        return this.dictionaryService.findValidWordsMatching(potentialWordFormat);
    }

    getWordOnBoard(rowIndex: number, board: Box[][]): WordOnBoard {
        let startPositionOnBoard = 0;
        let wordOnBoard = '';

        for (let i = 0; i <= MAX_COLUMN_INDEX; i++) {
            if (board[rowIndex][i].letter !== '') {
                startPositionOnBoard = i;
            }
            let j: number = i;
            while (j < board[rowIndex].length && board[rowIndex][j].letter !== '') {
                wordOnBoard = wordOnBoard.concat(board[rowIndex][j].letter);
                j++;
            }

            if (j > i) break;
        }

        return {
            startPosition: startPositionOnBoard,
            word: wordOnBoard,
        };
    }

    validateWordForHumanPlayer(params: PlaceCommandParameters): CommandStatus {
        const humanPlacementFirstTurnValid: boolean =
            this.gameModeService.board[INDEX_MIDDLE_CASE][INDEX_MIDDLE_CASE].letter === '' &&
            params.row === INDEX_MIDDLE_CASE &&
            params.column === INDEX_MIDDLE_CASE + 1 &&
            this.dictionaryService.wordList.indexOf(params.word) >= 0;
        const isWordAlreadyOnBoard: boolean = this.isWordAlreadyOnBoard({
            word: params.word.toLowerCase(),
            score: 0,
            startPosition: { row: params.row, column: params.column },
        });
        if (this.gameModeService.match.type === MatchType.Solo && this.gameModeService.match.activePlayer)
            return CommandStatus.SUCESS_PLACE_COMMAND_DICTIONNARY_VALIDE;

        if (humanPlacementFirstTurnValid) {
            return CommandStatus.SUCESS_PLACE_COMMAND_DICTIONNARY_VALIDE;
        }

        if (isWordAlreadyOnBoard) return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
        let board: Box[][] = this.gameModeService.board;
        if (params.direction === 'v') board = this.transposeBoard(this.gameModeService.board);
        const isWordNearExistingWord = this.isPlacementNearExistingWord(params, board);
        const middleBoxIsEmpty = this.gameModeService.board[INDEX_MIDDLE_CASE][INDEX_MIDDLE_CASE].letter === '';
        const placementPossible = isWordNearExistingWord || middleBoxIsEmpty;
        if (!placementPossible) return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
        const wordOnBoard: WordOnBoard = this.getWordOnBoard(params.row, board);

        const isWordOnRowInDictionary = this.isPotentialWordPlacedOnRowInDictionary(params.word.toLowerCase(), wordOnBoard, params.row, board);

        if (!isWordOnRowInDictionary) return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;

        for (const letter of params.word) {
            const newLetterToPlace: NewLetterToPlace = {
                board,
                letter,
                rowIndex: params.row,
                columnIndex: params.column,
            };
            if (!this.isCrossCheckOnColumnValid(newLetterToPlace)) return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
            if (params.direction === 'h') params.column++;
            else params.row++;
        }

        return CommandStatus.SUCESS_PLACE_COMMAND_DICTIONNARY_VALIDE;
    }

    isPlacementNearExistingWord(params: PlaceCommandParameters, board: Box[][]): boolean {
        const index: number = params.direction === 'h' ? params.column - 1 : params.row;
        const indexCondition: number =
            params.direction === 'h'
                ? Math.min(params.column + params.word.length - 1, MAX_COLUMN_INDEX)
                : Math.min(params.row + params.word.length, MAX_ROW_INDEX);
        const paramsRow: number = params.direction === 'h' ? params.row : params.column - 1;
        for (let i = index; i <= indexCondition; i++) {
            const isNearExistingWord: boolean =
                board[Math.min(paramsRow + 1, MAX_ROW_INDEX)][i].letter !== '' ||
                board[Math.max(paramsRow - 1, 0)][i].letter !== '' ||
                board[paramsRow][Math.max(i - 1, 0)].letter !== '' ||
                board[paramsRow][Math.min(i + 1, MAX_COLUMN_INDEX)].letter !== '';
            if (isNearExistingWord) return true;
        }

        return false;
    }

    transposeBoard(board: Box[][]): Box[][] {
        return this.scoreService.transposeBoard(board);
    }

    generateScoreForPotentialWords(potentialWords: PotentialWord[]): PotentialWord[] {
        return this.scoreService.generateScoreForPotentialWords(potentialWords);
    }

    pickPotentialWord(potentialWords: PotentialWord[]): PotentialWord {
        return this.scoreService.pickPotentialWord(potentialWords);
    }

    calculateScoreOfTurn(placeParams: PlaceCommandParameters): number {
        return this.scoreService.calculateScoreOfTurn(placeParams);
    }

    addBonusToScore(score: number): number {
        score += BONUS_ALL_LETTERS_OF_TRAY;
        return score;
    }

    isWordAlreadyOnBoard(potentialWordToPlace: PotentialWord): boolean {
        let check = false;

        for (const wordOnBoard of this.gameModeService.match.wordsOnBoard) {
            const potentialWordExistInBoard: boolean =
                wordOnBoard.word === potentialWordToPlace.word &&
                wordOnBoard.startPosition.row === potentialWordToPlace.startPosition.row &&
                wordOnBoard.startPosition.column === potentialWordToPlace.startPosition.column;
            if (potentialWordExistInBoard) {
                check = true;
                break;
            }
        }
        return check;
    }
}
