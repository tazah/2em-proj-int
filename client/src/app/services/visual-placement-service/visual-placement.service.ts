import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2/vec2';
import { LetterState, VisualLetterOnBoard } from '@app/classes/visual-letter-on-board/visual-letter-on-board';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import {
    BACKSPACE,
    CAPSLOCK,
    COLUMN_UNDEFINED,
    ESCAPE,
    INDEX_NOT_FOUND,
    INDEX_UNDEFINED,
    MAX_COLUMN,
    MAX_COLUMN_INDEX,
    MAX_ROW,
    ROW_UNDEFINED,
    SHIFT,
} from '@common/constants/constants';
import { Coordinates } from '@common/coordinates/coordinates';

@Injectable({
    providedIn: 'root',
})
export class VisualPlacementService {
    positionSelectedBox: Coordinates;
    wordToPlace: VisualLetterOnBoard[];
    direction: string;
    constructor(private localGameService: LocalGameHandlerService, private drawService: DrawService) {
        this.wordToPlace = [];
        this.direction = 'h';
        this.positionSelectedBox = { column: COLUMN_UNDEFINED, row: ROW_UNDEFINED };
        this.initializeVisualPlacement();
    }

    initializeVisualPlacement(): void {
        this.wordToPlace = [];
        this.direction = 'h';
        this.positionSelectedBox = { column: COLUMN_UNDEFINED, row: ROW_UNDEFINED };
    }

    keyTreatment(keyPressed: string) {
        keyPressed = keyPressed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Source: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
        const opponentTurn = this.localGameService.match.activePlayer;
        const indexOfStarInTray = this.localGameService.match.players[0].tray.indexOf('*', 0);
        if (opponentTurn) return;
        const validKey = new RegExp('^[' + this.localGameService.match.players[0].tray.join('') + ']{1}');
        const whiteKey = new RegExp('^[A-Z]{1}$');
        const isCapsLock = keyPressed === CAPSLOCK;
        const isShift = keyPressed === SHIFT;
        const isWhiteKey = whiteKey.test(keyPressed) && indexOfStarInTray > INDEX_NOT_FOUND && !isCapsLock && !isShift;

        if (keyPressed === BACKSPACE) {
            this.removeLetterFromBoard(this.direction);
            return;
        }
        if (validKey.test(keyPressed)) {
            this.placeValidKey(keyPressed);
            return;
        }
        if (isWhiteKey) {
            this.placeWhiteKey(keyPressed);
            return;
        }
        if (keyPressed === ESCAPE) {
            this.cancelPlacement();
            return;
        }
    }

    selectBox(positionSelected: Vec2): void {
        const opponentTurn = this.localGameService.match.activePlayer;
        const startedPlacingWord = Boolean(this.wordToPlace.length);
        if (opponentTurn || startedPlacingWord) return;

        const tempPositionSelectedBox = this.drawService.gridService.positionToCoordinates(positionSelected);
        const isBoxEmpty: boolean = this.localGameService.board[tempPositionSelectedBox.row][tempPositionSelectedBox.column].letter !== '';
        if (isBoxEmpty) {
            this.positionSelectedBox = { column: COLUMN_UNDEFINED, row: ROW_UNDEFINED };
            return;
        }
        if (tempPositionSelectedBox.column === this.positionSelectedBox.column && tempPositionSelectedBox.row === this.positionSelectedBox.row)
            this.direction = this.direction === 'h' ? 'v' : 'h';
        this.positionSelectedBox = tempPositionSelectedBox;
    }

    detectNextEmptyBox(): Coordinates {
        const isOutOfBoard: boolean = this.positionSelectedBox.column === COLUMN_UNDEFINED || this.positionSelectedBox.row === ROW_UNDEFINED;
        if (isOutOfBoard) return { column: COLUMN_UNDEFINED, row: ROW_UNDEFINED };
        let i = 0;

        let deletedCoordinates: Coordinates =
            this.direction === 'v'
                ? {
                      row: this.positionSelectedBox.row + i,
                      column: this.positionSelectedBox.column,
                  }
                : {
                      row: this.positionSelectedBox.row,
                      column: this.positionSelectedBox.column + i,
                  };

        while (this.localGameService.board[deletedCoordinates.row][deletedCoordinates.column].letter !== '') {
            i++;
            deletedCoordinates =
                this.direction === 'v'
                    ? {
                          row: this.positionSelectedBox.row + i,
                          column: this.positionSelectedBox.column,
                      }
                    : {
                          row: this.positionSelectedBox.row,
                          column: this.positionSelectedBox.column + i,
                      };

            const isEndOfEmptyPlacement =
                (this.direction === 'v' && deletedCoordinates.row === MAX_ROW) ||
                (this.direction === 'h' && deletedCoordinates.column === MAX_COLUMN);
            if (isEndOfEmptyPlacement) return { column: COLUMN_UNDEFINED, row: ROW_UNDEFINED };
        }
        return this.direction === 'v'
            ? { column: this.positionSelectedBox.row + i, row: this.positionSelectedBox.column + 1 }
            : { column: this.positionSelectedBox.row + 1, row: this.positionSelectedBox.column + i };
    }

    detectCoordinatesLastAddedLetter(): Coordinates {
        const lastAddedLetterIndex = this.detectLastAddedLetterIndex();
        if (lastAddedLetterIndex === INDEX_UNDEFINED) return { row: -1, column: -1 };
        return this.direction === 'h'
            ? { column: this.positionSelectedBox.row + 1, row: this.positionSelectedBox.column + lastAddedLetterIndex + 1 }
            : { column: this.positionSelectedBox.row + lastAddedLetterIndex + 1, row: this.positionSelectedBox.column + 1 };
    }

    createPlacementCommand(): string {
        const coordinatesOfPlacement: Coordinates =
            this.direction === 'h'
                ? { row: this.positionSelectedBox.row, column: this.findPrefixMaxIndex() + 2 }
                : { row: this.findPrefixMaxIndex() + 2, column: this.positionSelectedBox.column };
        return (
            '!placer ' +
            this.drawService.gridService.positionToIndex(coordinatesOfPlacement).toLowerCase() +
            this.direction +
            ' ' +
            this.pickFinalWordToPlace()
        );
    }

    cancelPlacement(): void {
        while (this.wordToPlace.length) this.removeLetterFromBoard(this.direction);
        this.positionSelectedBox = { column: COLUMN_UNDEFINED, row: ROW_UNDEFINED };
    }

    private pickFinalWordToPlace(): string {
        let finalWordToPlace = '';
        for (let i = this.findPrefixMaxIndex(); i <= this.findSuffixMaxIndex(); i++) {
            finalWordToPlace +=
                this.direction === 'h'
                    ? this.localGameService.board[this.positionSelectedBox.row][i].letter
                    : this.localGameService.board[i][this.positionSelectedBox.column].letter;
        }
        return finalWordToPlace;
    }

    private findPrefixMaxIndex(): number {
        let index: number = this.direction === 'h' ? this.positionSelectedBox.column : this.positionSelectedBox.row;

        let prefixCoordinates: Coordinates =
            this.direction === 'h'
                ? {
                      row: this.positionSelectedBox.row,
                      column: index,
                  }
                : {
                      row: index,
                      column: this.positionSelectedBox.column,
                  };

        let isPrefixMax: boolean = index >= 0 && this.localGameService.board[prefixCoordinates.row][prefixCoordinates.column].letter !== '';
        while (isPrefixMax) {
            index--;
            prefixCoordinates =
                this.direction === 'h'
                    ? { row: this.positionSelectedBox.row, column: index }
                    : { row: index, column: this.positionSelectedBox.column };

            isPrefixMax = index >= 0 && this.localGameService.board[prefixCoordinates.row][prefixCoordinates.column].letter !== '';
        }

        return index - 1;
    }

    private findSuffixMaxIndex(): number {
        let index: number = this.direction === 'h' ? this.positionSelectedBox.column + this.wordToPlace.length - 1 : this.positionSelectedBox.row;

        let suffixCoordinates: Coordinates =
            this.direction === 'h'
                ? {
                      row: this.positionSelectedBox.row,
                      column: index,
                  }
                : {
                      row: index,
                      column: this.positionSelectedBox.column,
                  };

        let isSuffixMax: boolean =
            index <= MAX_COLUMN_INDEX && this.localGameService.board[suffixCoordinates.row][suffixCoordinates.column].letter !== '';

        while (isSuffixMax) {
            index++;
            suffixCoordinates =
                this.direction === 'h'
                    ? {
                          row: this.positionSelectedBox.row,
                          column: index,
                      }
                    : {
                          row: index,
                          column: this.positionSelectedBox.column,
                      };
            isSuffixMax = index <= MAX_COLUMN_INDEX && this.localGameService.board[suffixCoordinates.row][suffixCoordinates.column].letter !== '';
        }

        return index - 1;
    }

    private detectLastAddedLetterIndex(): number {
        for (let i: number = this.wordToPlace.length - 1; i >= 0; i--) {
            const isLastLetter: boolean =
                this.wordToPlace[i].state === LetterState.PlacedOnBoard || this.wordToPlace[i].state === LetterState.WhiteLetter;
            if (isLastLetter) return i;
        }
        return INDEX_UNDEFINED;
    }

    private placeLetterInBox(keyPressed: string, coords: Coordinates, keyType: string) {
        let i = 0;
        const board = this.localGameService.board;

        let coordinatesOfPlacement: Coordinates =
            this.direction === 'h' ? { row: coords.row, column: coords.column + i } : { row: coords.row + i, column: coords.column };

        let isPlacementValid: boolean =
            board[coordinatesOfPlacement.row][coordinatesOfPlacement.column].letter !== '' && coordinatesOfPlacement.column < MAX_COLUMN;
        while (isPlacementValid) {
            this.wordToPlace.push({
                letter: board[coordinatesOfPlacement.row][coordinatesOfPlacement.column].letter,
                state: LetterState.WasAlreadyOnBoard,
            });
            i++;
            coordinatesOfPlacement =
                this.direction === 'h' ? { row: coords.row, column: coords.column + i } : { row: coords.row + i, column: coords.column };

            isPlacementValid =
                board[coordinatesOfPlacement.row][coordinatesOfPlacement.column].letter !== '' && coordinatesOfPlacement.column < MAX_COLUMN;
        }
        board[coordinatesOfPlacement.row][coordinatesOfPlacement.column].letter = keyPressed;

        const wordPlaced: VisualLetterOnBoard =
            keyType === 'White' ? { letter: keyPressed, state: LetterState.WhiteLetter } : { letter: keyPressed, state: LetterState.PlacedOnBoard };

        this.wordToPlace.push(wordPlaced);
    }

    private removeLetterFromBoard(direction: string) {
        if (!this.wordToPlace.length) return;
        let i = this.wordToPlace.length - 1;
        while (this.wordToPlace[i].state === LetterState.WasAlreadyOnBoard) {
            this.wordToPlace.pop();
            i--;
        }
        const REMOVE_COORDINATES: Coordinates =
            direction === 'h'
                ? { row: this.positionSelectedBox.row, column: this.positionSelectedBox.column + i }
                : { row: this.positionSelectedBox.row + i, column: this.positionSelectedBox.column };

        this.localGameService.board[REMOVE_COORDINATES.row][REMOVE_COORDINATES.column].letter = '';
        if (this.wordToPlace[i].state === LetterState.WhiteLetter) {
            this.localGameService.match.players[0].tray.push('*');
            this.wordToPlace.pop();
            return;
        }
        this.localGameService.match.players[0].tray.push(this.wordToPlace.pop()?.letter as string);
    }

    private placeWhiteKey(keyPressed: string) {
        const placeCoordinates: Coordinates =
            this.direction === 'h'
                ? { row: this.positionSelectedBox.row, column: this.positionSelectedBox.column + this.wordToPlace.length }
                : { row: this.positionSelectedBox.row + this.wordToPlace.length, column: this.positionSelectedBox.column };
        const selectedBoxCoordinate: number =
            this.direction === 'h' ? this.positionSelectedBox.column : this.positionSelectedBox.row + this.wordToPlace.length;
        if (selectedBoxCoordinate + this.wordToPlace.length <= MAX_COLUMN_INDEX) {
            this.placeLetterInBox(keyPressed, placeCoordinates, 'White');
            this.localGameService.match.players[0].tray.splice(this.localGameService.match.players[0].tray.indexOf('*'), 1);
        }
    }

    private placeValidKey(keyPressed: string): void {
        const placeCoordinates: Coordinates =
            this.direction === 'h'
                ? { row: this.positionSelectedBox.row, column: this.positionSelectedBox.column + this.wordToPlace.length }
                : { row: this.positionSelectedBox.row + this.wordToPlace.length, column: this.positionSelectedBox.column };
        const selectedBoxCoordinate: number = this.direction === 'h' ? this.positionSelectedBox.column : this.positionSelectedBox.row;

        if (selectedBoxCoordinate + this.wordToPlace.length <= MAX_COLUMN_INDEX) {
            this.placeLetterInBox(keyPressed, placeCoordinates, 'Valid');
            this.localGameService.match.players[0].tray.splice(this.localGameService.match.players[0].tray.indexOf(keyPressed), 1);
        }
    }
}
