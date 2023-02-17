import { Box } from '@app/../../common/box/box';
import {
    END_RANGE_SEVEN_TWELVE,
    END_RANGE_THIRTEEN_EIGHTEEN,
    END_RANGE_ZERO_SIX,
    MAX_COLUMN,
    MAX_ROW_INDEX,
    PROBABILITY_SCORE_RANGE_SEVEN_TWELVE,
    PROBABILITY_SCORE_RANGE_ZERO_SIX,
    SCORE_OF_UNDEFINED,
    START_RANGE_SEVEN_TWELVE,
    START_RANGE_THIRTEEN_EIGHTEEN,
    START_RANGE_ZERO_SIX,
} from '@app/../../common/constants/constants';
import { LetterTile } from '@app/../../common/letter-tile/letter-tile';
import { PotentialWord } from '@app/../../common/potential-word/potential-word';
import { PlaceCommandParameters } from '@app/classes/place-command-parameters/place-command-parameters';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { Coordinates } from '@common/coordinates/coordinates';
import { NewLetterToPlace } from '@common/new-letter-to-place/new-letter-to-place';
import { Service } from 'typedi';

@Service()
export class ScoreService {
    constructor(private gameModeService: GameModeService) {}

    countWordScore(newLetterToPlace: NewLetterToPlace): number {
        let score = 0;
        let coefficient = 1;
        const column = newLetterToPlace.columnIndex;
        const potentialWord = newLetterToPlace.letter;
        for (let i = column; i < potentialWord.length + column; i++) {
            const letterTile: LetterTile = this.gameModeService.bank.bank.get(potentialWord[i - column]) as LetterTile;
            if (newLetterToPlace.board[newLetterToPlace.rowIndex][i].boxType.type === 'Letter') {
                score += letterTile?.weight * newLetterToPlace.board[newLetterToPlace.rowIndex][i].boxType.value;
            }
            if (letterTile && newLetterToPlace.board[newLetterToPlace.rowIndex][i].boxType.type === 'Word') {
                if (newLetterToPlace.board[newLetterToPlace.rowIndex][i].boxType.type === 'Word') {
                    score += letterTile?.weight;
                    coefficient *= newLetterToPlace.board[newLetterToPlace.rowIndex][i].boxType.value;
                }
            }
        }
        score *= coefficient;
        return score;
    }

    countPotentialWordScore(potentialWord: string, columnIndex: number): number {
        let score = 0;
        const column = columnIndex;
        for (let i = column; i < potentialWord.length + column; i++) {
            const letterTile: LetterTile = this.gameModeService.bank.bank.get(potentialWord[i - column]) as LetterTile;
            score += letterTile?.weight;
        }
        return score;
    }

    clearBoxTypeValue(newLetterToPlace: NewLetterToPlace): void {
        const board: Box[][] = newLetterToPlace.board;
        const potentialWord = newLetterToPlace.letter;
        const rowIndex = newLetterToPlace.rowIndex;
        const columnIndex = newLetterToPlace.columnIndex;

        for (let i = columnIndex; i < Math.min(MAX_COLUMN, potentialWord.length + columnIndex); i++) {
            board[rowIndex][i].boxType.value = 1;
        }
    }

    getPotentialWordsScoresInRange(potentialWords: PotentialWord[], rangeMin: number, rangeMax: number): PotentialWord[] {
        let potentialWordsSorted: PotentialWord[] = potentialWords.sort((potentialWord1, potentialWord2) => {
            if (potentialWord1.score > potentialWord2.score) {
                return 1;
            }

            if (potentialWord1.score < potentialWord2.score) {
                return SCORE_OF_UNDEFINED;
            }

            return 0;
        });
        potentialWordsSorted = potentialWordsSorted.filter((potentialWord) => potentialWord.score >= rangeMin && potentialWord.score <= rangeMax);
        return potentialWordsSorted;
    }

    generateScoreForPotentialWords(potentialWords: PotentialWord[]): PotentialWord[] {
        for (const potentialWord of potentialWords) {
            potentialWord.score = this.countPotentialWordScore(
                potentialWord.word,

                potentialWord.startPosition.column,
            );
        }
        return potentialWords;
    }

    pickPotentialWord(potentialWords: PotentialWord[]): PotentialWord {
        let potentialWordsInRange: PotentialWord[] = Array<PotentialWord>();
        const placeRangeChoiceProbability: number = Math.random();
        const isInZeroToSixRange: boolean = placeRangeChoiceProbability <= PROBABILITY_SCORE_RANGE_ZERO_SIX;
        const isInSixToSevenRange: boolean =
            placeRangeChoiceProbability > PROBABILITY_SCORE_RANGE_ZERO_SIX && placeRangeChoiceProbability <= PROBABILITY_SCORE_RANGE_SEVEN_TWELVE;
        const isInSevenToTwelveRange: boolean = placeRangeChoiceProbability > PROBABILITY_SCORE_RANGE_SEVEN_TWELVE;
        switch (true) {
            case isInZeroToSixRange: {
                potentialWordsInRange = this.getPotentialWordsScoresInRange(potentialWords, START_RANGE_ZERO_SIX, END_RANGE_ZERO_SIX);
                break;
            }
            case isInSixToSevenRange: {
                potentialWordsInRange = this.getPotentialWordsScoresInRange(potentialWords, START_RANGE_SEVEN_TWELVE, END_RANGE_SEVEN_TWELVE);
                break;
            }
            case isInSevenToTwelveRange: {
                potentialWordsInRange = this.getPotentialWordsScoresInRange(
                    potentialWords,
                    START_RANGE_THIRTEEN_EIGHTEEN,
                    END_RANGE_THIRTEEN_EIGHTEEN,
                );
                break;
            }
        }
        if (potentialWordsInRange.length > 0) return potentialWordsInRange[Math.floor(Math.random() * potentialWordsInRange.length)];
        return potentialWords[potentialWords.length - 1];
    }

    calculateScoreOfResultedWords(board: Box[][], potentialWord: string, coordinates: Coordinates): number {
        let verticalScore = 0;
        let verticalScoreForLetter = 0;
        let coefficient = 1;

        for (let i = coordinates.column; i < Math.min(MAX_COLUMN, potentialWord.length + coordinates.column); i++) {
            if (board[coordinates.row][i - coordinates.column].letter) {
                let letterTile: LetterTile = this.gameModeService.bank.bank.get(potentialWord[i - coordinates.column]) as LetterTile;
                if (letterTile) verticalScore += letterTile.weight;

                let j: number = coordinates.row - 1;
                while (j >= 0 && board[j][i].letter !== '') {
                    letterTile = this.gameModeService.bank.bank.get(board[j][i].letter) as LetterTile;
                    if (board[j][i].boxType.type === 'Letter') {
                        verticalScoreForLetter += letterTile.weight * board[j][i].boxType.value;
                    }

                    if (board[j][i].boxType.type === 'Word') {
                        verticalScoreForLetter += letterTile.weight;
                        coefficient *= board[j][i].boxType.value;
                    }
                    j--;
                }
                let k: number = coordinates.row + 1;
                while (k <= MAX_ROW_INDEX && board[k][i].letter !== '') {
                    letterTile = this.gameModeService.bank.bank.get(board[k][i].letter) as LetterTile;
                    if (board[k][i].boxType.type === 'Letter') {
                        verticalScoreForLetter += letterTile.weight * board[k][i].boxType.value;
                    }

                    if (board[coordinates.row][i].boxType.type === 'Word') {
                        verticalScoreForLetter += letterTile.weight;
                        coefficient *= board[k][i].boxType.value;
                    }
                    k++;
                }
                if (verticalScoreForLetter !== 0) if (letterTile) verticalScoreForLetter += letterTile.weight;

                verticalScore += verticalScoreForLetter * coefficient;
            }
        }

        return verticalScore;
    }

    calculateScoreOfTurn(placeParams: PlaceCommandParameters): number {
        let finalScore = 0;
        if (placeParams.direction === 'v') {
            const transposedBoard: Box[][] = this.transposeBoard(this.gameModeService.board);
            const coordinates: Coordinates = { row: placeParams.column - 1, column: placeParams.row };
            const newLetterToPlace: NewLetterToPlace = {
                board: transposedBoard,
                rowIndex: Math.max(0, placeParams.column - 1),
                columnIndex: placeParams.row,
                letter: placeParams.word,
            };
            finalScore = this.calculateScoreOfResultedWords(transposedBoard, placeParams.word, coordinates) + this.countWordScore(newLetterToPlace);
            this.clearBoxTypeValue(newLetterToPlace);
        } else {
            const coordinates: Coordinates = { row: placeParams.column, column: placeParams.row - 1 };
            const newLetterToPlace: NewLetterToPlace = {
                board: this.gameModeService.board,
                rowIndex: placeParams.row,
                columnIndex: Math.max(0, placeParams.column - 1),
                letter: placeParams.word,
            };
            finalScore =
                this.calculateScoreOfResultedWords(this.gameModeService.board, placeParams.word, coordinates) + this.countWordScore(newLetterToPlace);
            this.clearBoxTypeValue(newLetterToPlace);
        }
        return finalScore;
    }

    transposeBoard(board: Box[][]): Box[][] {
        const transposedBoard: Box[][] = this.gameModeService.initializationService.initializeBoard(this.gameModeService.match.boardConfiguration);
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                transposedBoard[i][j] = board[j][i];
            }
        }
        return transposedBoard;
    }
}
