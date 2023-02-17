import { Injectable } from '@angular/core';
import { LetterToDraw } from '@app/classes/letter-to-draw/letter-to-draw';
import { Vec2 } from '@app/classes/vec2/vec2';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { ArrowToDraw } from '@common/arrow-to-draw/arrow-to-draw';
import { Box } from '@common/box/box';
import {
    A_ASCII,
    BOX_BORDER_WIDTH,
    BOX_TYPE_FONT_SIZE,
    COLUMN_UNDEFINED,
    DEFAULT_BOX_HEIGHT,
    DEFAULT_BOX_WIDTH,
    DEFAULT_HEIGHT,
    DEFAULT_LETTER_TO_DRAW,
    DEFAULT_NUMBER_TO_DRAW,
    DEFAULT_WIDTH,
    DrawingAdjustments,
    GRID_LINE_WIDTH,
    HALF_BOX_WIDTH,
    LEFT_MARGIN_BOX_TYPE,
    LETTER_ON_BOARD_X_COORDINATES,
    MAX_COLUMN_INDEX,
    MAX_ROW,
    MAX_ROW_INDEX,
    STAR_ASCII_CODE,
    STAR_BOX_FONT_SIZE,
    STAR_SIZE,
    STEP_LETTER_BOX_TYPE,
    STEP_WORD_BOX_TYPE,
} from '@common/constants/constants';
import { Coordinates } from '@common/coordinates/coordinates';
import { LetterTile } from '@common/letter-tile/letter-tile';
import { Location } from '@common/location/location';
import { GridService } from './../grid-service/grid.service';
@Injectable()
export class DrawService {
    gridContext: CanvasRenderingContext2D;
    board: Box[][];
    private canvasSize: Vec2;
    constructor(public localGameHandler: LocalGameHandlerService, public gridService: GridService) {
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
        this.board = new Array<Box[]>();
    }

    initializeBoardBoxes(fontSize: number): void {
        for (let i = 0; i <= MAX_ROW_INDEX; i++)
            for (let j = 0; j <= MAX_COLUMN_INDEX; j++) {
                this.drawBox(this.localGameHandler.board[i][j]);
                if (this.localGameHandler.board[i][j].letter !== '') {
                    this.fillBox(String.fromCharCode(A_ASCII + i) + (j + 1).toString(), this.localGameHandler.board[i][j].letter, fontSize);
                }
            }
    }

    drawGrid() {
        for (let i = 0; i <= MAX_ROW; i++) {
            this.drawBoardHorizontalLine(DEFAULT_BOX_HEIGHT * i);
            this.drawBoardVerticalLine(DEFAULT_BOX_WIDTH * i);
        }
    }

    drawLetters(letterToDraw: LetterToDraw) {
        this.gridContext.font = letterToDraw.size + 'px system-ui';
        for (let i = 0; i < letterToDraw.word.length; i++) {
            if (letterToDraw.direction === 'V')
                this.gridContext.fillText(letterToDraw.word[i], letterToDraw.startPosition.x, letterToDraw.startPosition.y + letterToDraw.step * i);
            else if (letterToDraw.direction === 'H')
                this.gridContext.fillText(letterToDraw.word[i], letterToDraw.startPosition.x + letterToDraw.step * i, letterToDraw.startPosition.y);
        }
    }

    drawArrowOnBox(arrowToDraw: ArrowToDraw) {
        this.gridContext.strokeStyle = 'black';
        const middleBoxPosition = this.gridService.coordinatesToPosition(arrowToDraw.boxCoordinates);
        let x0 = 0;
        let y0 = 0;
        let x1 = 0;
        let y1 = 0;
        const aWidth = 5;
        const aLength = 8;
        if (arrowToDraw.direction === 'v') {
            x0 = middleBoxPosition.x;
            y0 = middleBoxPosition.y + DEFAULT_BOX_HEIGHT / 2;
            x1 = middleBoxPosition.x;
            y1 = middleBoxPosition.y + DEFAULT_BOX_HEIGHT;
        } else {
            x0 = middleBoxPosition.x + DEFAULT_BOX_WIDTH / 2;
            y0 = middleBoxPosition.y;
            x1 = middleBoxPosition.x + DEFAULT_BOX_WIDTH;
            y1 = middleBoxPosition.y;
        }
        const dx = x1 - x0;
        const dy = y1 - y0;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);
        this.gridContext.translate(x0, y0);
        this.gridContext.rotate(angle);
        this.gridContext.beginPath();
        this.gridContext.moveTo(0, 0);
        this.gridContext.lineTo(length, 0);
        if (arrowToDraw.arrowStart) {
            this.gridContext.moveTo(aLength, -aWidth);
            this.gridContext.lineTo(0, 0);
            this.gridContext.lineTo(aLength, aWidth);
        }
        if (arrowToDraw.arrowEnd) {
            this.gridContext.moveTo(length - aLength, -aWidth);
            this.gridContext.lineTo(length, 0);
            this.gridContext.lineTo(length - aLength, aWidth);
        }
        this.gridContext.stroke();
        this.gridContext.setTransform(1, 0, 0, 1, 0, 0);
    }

    drawNumbers(word: string) {
        const startPosition: Vec2 = { x: 18, y: 25 };
        const step = 45;
        this.gridContext.font = '20px system-ui';
        const space: string[] = word.split(' ');
        for (let i = 0; i < space.length; i++) {
            this.drawCombinedNumbers(space[i], { x: startPosition.x + step * i, y: startPosition.y });
        }
    }

    private get width(): number {
        return this.canvasSize.x;
    }

    private get height(): number {
        return this.canvasSize.y;
    }

    drawBoarderOnLastAddedLetter(boxCoordinates: Coordinates) {
        if (boxCoordinates.column === COLUMN_UNDEFINED) return;
        const middleBoxPosition = this.gridService.coordinatesToPosition(boxCoordinates);
        this.gridContext.strokeStyle = '#FF0000';
        this.gridContext.strokeRect(
            middleBoxPosition.x - DEFAULT_BOX_WIDTH / 2,
            middleBoxPosition.y - DEFAULT_BOX_HEIGHT / 2,
            DEFAULT_BOX_WIDTH,
            DEFAULT_BOX_HEIGHT,
        );
    }

    private drawCombinedNumbers(word: string, startPosition: Vec2) {
        const stepCombined = 10;
        this.gridContext.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillText(word[i], startPosition.x + stepCombined * i, startPosition.y);
        }
    }

    private drawTile(color: string, location: Location, tileType: string): void {
        this.gridContext.fillStyle = color;
        this.gridContext.fillRect(location.x, location.y, location.w, location.h);
        this.gridContext.fillStyle = tileType;
    }

    private drawBox(box: Box): void {
        const boxCoordinatesIndex = this.gridService.indexToPosition(
            String.fromCharCode(A_ASCII + box.coordinates.row) + (box.coordinates.column + 1).toString(),
        );
        const numberCoordinatesIndex: Vec2 = {
            x: boxCoordinatesIndex.x - DrawingAdjustments.ADJUST_DRAW_NUMBER_X,
            y: boxCoordinatesIndex.y - DrawingAdjustments.ADJUST_DRAW_NUMBER_Y,
        };
        const letterCoordinatesIndex: Vec2 = {
            x: boxCoordinatesIndex.x - DrawingAdjustments.ADJUST_DRAW_LETTER_X,
            y: boxCoordinatesIndex.y + DrawingAdjustments.ADJUST_DRAW_LETTER_Y,
        };
        const wordCoordinatesIndex: Vec2 = {
            x: boxCoordinatesIndex.x - DrawingAdjustments.ADJUST_DRAW_WORD_X,
            y: boxCoordinatesIndex.y + DrawingAdjustments.ADJUST_DRAW_WORD_Y,
        };
        const starCoordinatesIndex: Vec2 = {
            x: boxCoordinatesIndex.x - DrawingAdjustments.STAR_X_ADJUSTMENT,
            y: boxCoordinatesIndex.y + DrawingAdjustments.STAR_Y_ADJUSTMENT,
        };
        this.gridContext.beginPath();
        const location: Location = {
            x: boxCoordinatesIndex.x - HALF_BOX_WIDTH,
            y: boxCoordinatesIndex.y - LEFT_MARGIN_BOX_TYPE,
            w: DEFAULT_BOX_WIDTH - BOX_BORDER_WIDTH,
            h: DEFAULT_BOX_HEIGHT - BOX_BORDER_WIDTH,
        };
        let letterToDraw: LetterToDraw = DEFAULT_LETTER_TO_DRAW;
        let numberToDraw: LetterToDraw = DEFAULT_NUMBER_TO_DRAW;
        switch (this.localGameHandler.match.boardConfiguration[box.coordinates.column + MAX_ROW * box.coordinates.row]) {
            case '-':
                this.gridContext.fillStyle = '#0000';
                break;
            case 'D':
                this.drawTile('#ad726f', location, 'white');
                numberToDraw = {
                    word: 'x2',
                    startPosition: numberCoordinatesIndex,
                    step: STEP_WORD_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                letterToDraw = {
                    word: 'Mot',
                    startPosition: wordCoordinatesIndex,
                    step: STEP_WORD_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                this.drawLetters(numberToDraw);
                this.drawLetters(letterToDraw);
                break;
            case 'T':
                this.drawTile('#661915', location, 'white');
                numberToDraw = {
                    word: 'x3',
                    startPosition: numberCoordinatesIndex,
                    step: STEP_WORD_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                letterToDraw = {
                    word: 'Mot',
                    startPosition: wordCoordinatesIndex,
                    step: STEP_WORD_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                this.drawLetters(numberToDraw);
                this.drawLetters(letterToDraw);
                break;
            case 'd':
                this.drawTile('#7991B9', location, 'white');
                numberToDraw = {
                    word: 'x2',
                    startPosition: numberCoordinatesIndex,
                    step: STEP_LETTER_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                letterToDraw = {
                    word: 'Lettre',
                    startPosition: letterCoordinatesIndex,
                    step: STEP_LETTER_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                this.drawLetters(numberToDraw);
                this.drawLetters(letterToDraw);
                break;
            case 't':
                this.drawTile('#2B408C', location, 'white');
                numberToDraw = {
                    word: 'x3',
                    startPosition: numberCoordinatesIndex,
                    step: STEP_LETTER_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                letterToDraw = {
                    word: 'Lettre',
                    startPosition: letterCoordinatesIndex,
                    step: STEP_LETTER_BOX_TYPE,
                    size: BOX_TYPE_FONT_SIZE,
                    direction: 'H',
                };
                this.drawLetters(numberToDraw);
                this.drawLetters(letterToDraw);
                break;
            case '*':
                this.drawTile('#ad726f', location, 'white');
                letterToDraw = {
                    word: String.fromCharCode(STAR_ASCII_CODE),
                    startPosition: { x: starCoordinatesIndex.x, y: starCoordinatesIndex.y },
                    step: STAR_BOX_FONT_SIZE,
                    size: STAR_SIZE,
                    direction: 'H',
                };
                this.drawLetters(letterToDraw);
                break;
        }
    }

    private fillBox(position: string, letter: string, fontSize: number): void {
        const whiteKey = new RegExp('^[A-Z]{1}$');
        const boxCoordinatesIndex = this.gridService.indexToPosition(position);

        const letterCoordinatesIndex: Vec2 = {
            x: boxCoordinatesIndex.x - DrawingAdjustments.LETTER_COORDINATE_ADJUST_X_AXIS,
            y: boxCoordinatesIndex.y + DrawingAdjustments.LETTER_COORDINATE_ADJUST_Y_AXIS,
        };
        const weightCoordinatesIndex: Vec2 = {
            x: boxCoordinatesIndex.x + DrawingAdjustments.WEIGHT_COORDINATE_ADJUST_X_AXIS,
            y: boxCoordinatesIndex.y + DrawingAdjustments.WEIGHT_COORDINATE_ADJUST_Y_AXIS,
        };
        this.gridContext.beginPath();
        this.gridContext.fillStyle = '#C3B7AC';
        this.gridContext.fillRect(
            boxCoordinatesIndex.x - DrawingAdjustments.RECTANGLE_ADJUST_X_AXIS,
            boxCoordinatesIndex.y - DrawingAdjustments.RECTANGLE_ADJUST_Y_AXIS,
            DEFAULT_BOX_WIDTH - 2,
            DEFAULT_BOX_HEIGHT - 2,
        );
        this.gridContext.fillStyle = 'black';
        const letterToDraw: LetterToDraw = {
            word: letter.toUpperCase(),
            startPosition: letterCoordinatesIndex,
            step: LETTER_ON_BOARD_X_COORDINATES,
            size: DrawingAdjustments.LETTER_FONT_ADJUST + fontSize,
            direction: 'H',
        };
        this.drawLetters(letterToDraw);
        const letterTile = whiteKey.test(letter)
            ? (this.localGameHandler.bank.get('*') as LetterTile)
            : (this.localGameHandler.bank.get(letter) as LetterTile);
        const weight = whiteKey.test(letter) ? '0' : letterTile.weight.toString();
        const tileToDraw: LetterToDraw = {
            word: weight,
            startPosition: weightCoordinatesIndex,
            step: LETTER_ON_BOARD_X_COORDINATES,
            size: DrawingAdjustments.WEIGHT_FONT_ADJUST + fontSize,
            direction: 'H',
        };
        this.drawLetters(tileToDraw);
    }

    private drawBoardVerticalLine(startX: number): void {
        this.gridContext.beginPath();
        this.gridContext.strokeStyle = '#927E5A';
        this.gridContext.lineWidth = GRID_LINE_WIDTH;
        this.gridContext.moveTo(startX, 0);
        this.gridContext.lineTo(startX, this.height);
        this.gridContext.stroke();
    }

    private drawBoardHorizontalLine(startY: number): void {
        this.gridContext.beginPath();
        this.gridContext.strokeStyle = '#927E5A';
        this.gridContext.lineWidth = GRID_LINE_WIDTH;
        this.gridContext.moveTo(0, startY);
        this.gridContext.lineTo(this.width, startY);
        this.gridContext.stroke();
    }
}
