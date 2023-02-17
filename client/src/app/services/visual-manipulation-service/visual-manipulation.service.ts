import { Injectable } from '@angular/core';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import {
    MAX_TRAY_INDEX,
    MOUSE_LEFT_BUTTON,
    MOUSE_RIGHT_BUTTON,
    SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED,
    TRAY_SIZE,
} from '@common/constants/constants';

@Injectable({
    providedIn: 'root',
})
export class VisualManipulationService {
    tray: string[];
    selectedLetterForManipulationIndex: number;
    selectedLettersForExchangeIndexes: number[];
    constructor(private localGame: LocalGameHandlerService) {
        this.tray = [];
        this.selectedLetterForManipulationIndex = SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED;
        this.selectedLettersForExchangeIndexes = [];
    }

    keyTreatment(keyPressed: string): void {
        keyPressed = keyPressed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Source: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
        const letterOnTray = new RegExp('^[' + this.localGame.match.players[0].tray.join('') + ']{1}');
        const isArrowKey = keyPressed === 'ArrowLeft' || keyPressed === 'ArrowRight';
        const selectedLetterIsInExchangeIndexes = this.selectedLettersForExchangeIndexes.includes(
            this.localGame.match.players[0].tray.indexOf(keyPressed),
        );
        if (isArrowKey) {
            this.swapSelectedLetter(this.extractSwapDirectionFromKey(keyPressed));
            return;
        }
        const isKeyPressed: boolean = letterOnTray.test(keyPressed) && !selectedLetterIsInExchangeIndexes;
        if (isKeyPressed) {
            this.selectTileWithKey(keyPressed);
            return;
        }
        this.selectedLetterForManipulationIndex = SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED;
    }

    selectTileWithMouse(event: MouseEvent, selectedTileIndex: number): void {
        if (event.button === MOUSE_LEFT_BUTTON) {
            this.selectedLettersForExchangeIndexes = [];
            this.selectedLetterForManipulationIndex = selectedTileIndex;
        }
        if (event.button === MOUSE_RIGHT_BUTTON) {
            this.selectedLetterForManipulationIndex = SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED;
            this.updateSelectedLettersForExchangeSelection(selectedTileIndex);
        }
    }

    swapLetterOnWheelAction(wheelEvent: WheelEvent): void {
        if (wheelEvent.deltaY >= 0) this.swapSelectedLetter('Right');
        if (wheelEvent.deltaY <= 0) this.swapSelectedLetter('Left');
    }
    cancelSelection(): void {
        this.selectedLettersForExchangeIndexes = [];
        this.selectedLetterForManipulationIndex = SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED;
    }

    createExchangeCommand(): string {
        let exchangeCommandMessage = '!échanger ';
        const numberOfSelectedTiles = this.selectedLettersForExchangeIndexes.length;
        for (let i = 0; i < numberOfSelectedTiles; i++)
            exchangeCommandMessage = exchangeCommandMessage + this.localGame.match.players[0].tray[this.selectedLettersForExchangeIndexes[i]];
        return exchangeCommandMessage;
    }

    private updateSelectedLettersForExchangeSelection(selectedTileIndex: number): void {
        if (this.selectedLettersForExchangeIndexes.includes(selectedTileIndex)) {
            this.selectedLettersForExchangeIndexes.splice(this.selectedLettersForExchangeIndexes.indexOf(selectedTileIndex), 1);
            return;
        }
        this.selectedLettersForExchangeIndexes.push(selectedTileIndex);
    }

    private updateSelectedLettersForExchangeIndexes(indexToExchange: number, newIndex: number): void {
        if (this.selectedLettersForExchangeIndexes.includes(indexToExchange)) {
            this.selectedLettersForExchangeIndexes[this.selectedLettersForExchangeIndexes.indexOf(indexToExchange)] = newIndex;
        }
    }

    private swapSelectedLetter(swapDirection: string): void {
        if (this.selectedLetterForManipulationIndex === SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED) return;
        const temporaryTile = this.localGame.match.players[0].tray[this.selectedLetterForManipulationIndex];
        const SWAP_COEFFICENT = swapDirection === 'Left' ? MAX_TRAY_INDEX : 1;
        this.updateSelectedLettersForExchangeIndexes(
            (this.selectedLetterForManipulationIndex + SWAP_COEFFICENT) % TRAY_SIZE,
            this.selectedLetterForManipulationIndex,
        );
        this.localGame.match.players[0].tray[this.selectedLetterForManipulationIndex] =
            this.localGame.match.players[0].tray[(this.selectedLetterForManipulationIndex + SWAP_COEFFICENT) % TRAY_SIZE];
        this.localGame.match.players[0].tray[(this.selectedLetterForManipulationIndex + SWAP_COEFFICENT) % TRAY_SIZE] = temporaryTile;
        this.selectedLetterForManipulationIndex = (this.selectedLetterForManipulationIndex + SWAP_COEFFICENT) % TRAY_SIZE;
    }

    private selectTileWithKey(keyPressed: string): void {
        this.selectedLettersForExchangeIndexes = [];
        let occurrence = this.selectedLetterForManipulationIndex + 1;
        if (keyPressed === this.localGame.match.players[0].tray[this.selectedLetterForManipulationIndex]) {
            while (this.localGame.match.players[0].tray[occurrence] !== keyPressed) {
                occurrence++;
                if (occurrence >= TRAY_SIZE) {
                    occurrence = occurrence % TRAY_SIZE;
                }
            }
            this.selectedLetterForManipulationIndex = occurrence;
            return;
        }
        this.selectedLetterForManipulationIndex = this.localGame.match.players[0].tray.indexOf(keyPressed, 0);
    }

    private extractSwapDirectionFromKey(keyPressed: string): string {
        if (keyPressed === 'ArrowLeft') return 'Left';
        if (keyPressed === 'ArrowRight') return 'Right';
        return '';
    }
}
