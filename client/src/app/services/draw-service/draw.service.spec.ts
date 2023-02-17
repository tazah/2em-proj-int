/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import { LetterToDraw } from '@app/classes/letter-to-draw/letter-to-draw';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { ArrowToDraw } from '@common/arrow-to-draw/arrow-to-draw';
import { ScoreCoefficient, ScoreType } from '@common/box/box';
import {
    COLUMN_UNDEFINED,
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
    NUMBER_GRID_LINES,
    RANDOM_FONT_SIZE,
    RANDOM_OFFSET,
    RANDOM_SIZE,
    RANDOM_STEP,
} from '@common/constants/constants';
import { GridService } from './../grid-service/grid.service';
import { DrawService } from './draw.service';

describe('DrawService', () => {
    let service: DrawService;
    let gridService: GridService;
    let ctxStub: CanvasRenderingContext2D;
    let localGame: LocalGameHandlerService;
    const emptyLetterToDraw: LetterToDraw = {
        word: '',
        startPosition: { x: RANDOM_OFFSET, y: RANDOM_OFFSET },
        step: RANDOM_STEP,
        size: RANDOM_SIZE,
        direction: 'H',
    };
    const horizontalLetterToDraw: LetterToDraw = {
        word: 'test',
        startPosition: { x: 0, y: 0 },
        step: RANDOM_STEP,
        size: RANDOM_SIZE,
        direction: 'H',
    };
    const horizontalOffsetLetterToDraw: LetterToDraw = {
        word: 'test',
        startPosition: { x: RANDOM_OFFSET, y: RANDOM_OFFSET },
        step: RANDOM_STEP,
        size: RANDOM_SIZE,
        direction: 'H',
    };
    const verticalLetterToDraw: LetterToDraw = {
        word: 'test',
        startPosition: { x: RANDOM_OFFSET, y: RANDOM_OFFSET },
        step: RANDOM_STEP,
        size: RANDOM_SIZE,
        direction: 'V',
    };
    const invalidLetterToDraw: LetterToDraw = {
        word: 'test',
        startPosition: { x: RANDOM_OFFSET, y: RANDOM_OFFSET },
        step: RANDOM_STEP,
        size: RANDOM_SIZE,
        direction: 'T',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DrawService, LocalGameHandlerService],
        });

        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
        gridService = TestBed.inject(GridService);
        localGame = TestBed.inject(LocalGameHandlerService);
        localGame.bank.set('a', { quantity: 9, weight: 1 });
        localGame.bank.set('b', { quantity: 2, weight: 3 });
        localGame.bank.set('c', { quantity: 2, weight: 3 });
        localGame.bank.set('d', { quantity: 3, weight: 2 });
        localGame.bank.set('e', { quantity: 15, weight: 1 });
        localGame.bank.set('f', { quantity: 2, weight: 4 });
        localGame.bank.set('g', { quantity: 2, weight: 2 });
        localGame.bank.set('h', { quantity: 2, weight: 4 });
        localGame.bank.set('i', { quantity: 8, weight: 1 });
        localGame.bank.set('j', { quantity: 1, weight: 8 });
        localGame.bank.set('k', { quantity: 1, weight: 10 });
        localGame.bank.set('l', { quantity: 5, weight: 1 });
        localGame.bank.set('m', { quantity: 3, weight: 2 });
        localGame.bank.set('n', { quantity: 6, weight: 1 });
        localGame.bank.set('o', { quantity: 6, weight: 1 });
        localGame.bank.set('p', { quantity: 2, weight: 3 });
        localGame.bank.set('q', { quantity: 1, weight: 8 });
        localGame.bank.set('r', { quantity: 6, weight: 1 });
        localGame.bank.set('s', { quantity: 6, weight: 1 });
        localGame.bank.set('t', { quantity: 6, weight: 1 });
        localGame.bank.set('u', { quantity: 6, weight: 1 });
        localGame.bank.set('v', { quantity: 2, weight: 4 });
        localGame.bank.set('w', { quantity: 1, weight: 10 });
        localGame.bank.set('x', { quantity: 1, weight: 10 });
        localGame.bank.set('y', { quantity: 1, weight: 10 });
        localGame.bank.set('z', { quantity: 1, weight: 10 });
        localGame.bank.set('*', { quantity: 2, weight: 0 });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service['width']).toEqual(DEFAULT_WIDTH);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service['height']).toEqual(DEFAULT_HEIGHT);
    });

    it(' drawLetters should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetters(horizontalLetterToDraw);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetters should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetters(emptyLetterToDraw);
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

    it(' drawLetters should call fillText as many times as letters in a word', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetters(horizontalOffsetLetterToDraw);
        expect(fillTextSpy).toHaveBeenCalledTimes(horizontalOffsetLetterToDraw.word.length);
    });

    it(' drawLetters should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service['width'], service['height']).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawLetters(horizontalOffsetLetterToDraw);
        imageData = service.gridContext.getImageData(0, 0, service['width'], service['height']).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawGrid should call moveTo and lineTo 32 times', () => {
        const expectedCallTimes = NUMBER_GRID_LINES;
        const moveToSpy = spyOn(service.gridContext, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridContext, 'lineTo').and.callThrough();
        service.drawGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawGrid should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service['width'], service['height']).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.gridContext.getImageData(0, 0, service['width'], service['height']).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' initializeBoardBoxes should call drawBox and fillBox on the canvas', () => {
        const drawBoxSpy = spyOn<any>(service, 'drawBox').and.callThrough();
        const fillBoxSpy = spyOn<any>(service, 'fillBox').and.callThrough();
        const fontSize = RANDOM_FONT_SIZE;

        const letter = 't';
        localGame.board[RANDOM_OFFSET][RANDOM_OFFSET].letter = letter;
        service.initializeBoardBoxes(fontSize);
        expect(drawBoxSpy).toHaveBeenCalled();
        expect(fillBoxSpy).toHaveBeenCalled();
    });

    it(' initializeBoardBoxes should call drawBox and fillBox on the canvas lala', () => {
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const drawLettersSpy = spyOn(service, 'drawLetters').and.callThrough();
        const fontSize = RANDOM_FONT_SIZE;
        const position = 'H8';
        const letter = 'l';
        service['fillBox'](position, letter, fontSize);
        expect(fillRectSpy).toHaveBeenCalled();
        expect(drawLettersSpy).toHaveBeenCalled();
    });

    it(' drawBox should call fillRect on the canvas', () => {
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const letter = 'L';
        service['drawBox']({ letter, coordinates: { row: 5, column: 5 }, boxType: { type: ScoreType.Letter, value: ScoreCoefficient.Normal } });
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it(' drawNumbers should call drawCombinedNumbers on the canvas', () => {
        const drawCombinedNumbersSpy = spyOn<any>(service, 'drawCombinedNumbers').and.callThrough();
        const numbers = '69 69 69';
        service.drawNumbers(numbers);
        expect(drawCombinedNumbersSpy).toHaveBeenCalled();
    });

    it(' drawCombinedNumbers should call  on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const numbers = '69 69 69';
        service['drawCombinedNumbers'](numbers, { x: RANDOM_OFFSET, y: RANDOM_OFFSET });
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetter in vertical direction should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetters(verticalLetterToDraw);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetter in Horizontal direction should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetters(horizontalOffsetLetterToDraw);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetter in a false direction should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetters(invalidLetterToDraw);
        expect(fillTextSpy).not.toHaveBeenCalled();
    });

    it(' should drawArrowOnBox() when direction is vertical', () => {
        const arrowToDraw: ArrowToDraw = {
            boxCoordinates: { row: 2, column: 2 },
            direction: 'v',
            arrowStart: true,
            arrowEnd: false,
        };
        spyOn(service, 'drawArrowOnBox');
        service.drawArrowOnBox(arrowToDraw);
        expect(service.drawArrowOnBox).toHaveBeenCalled();
    });

    it(' should drawArrowOnBox() when direction is Horizontal', () => {
        const arrowToDraw: ArrowToDraw = {
            boxCoordinates: { row: 2, column: 2 },
            direction: 'h',
            arrowStart: false,
            arrowEnd: true,
        };
        spyOn(service, 'drawArrowOnBox');
        service.drawArrowOnBox(arrowToDraw);
        expect(service.drawArrowOnBox).toHaveBeenCalled();
    });

    it('should do return and not call coordinatesToPosition() on call of drawBoarderOnLastAddedLetter if boxCoordinates.column = -1', () => {
        spyOn(service.gridService, 'coordinatesToPosition');
        service.drawBoarderOnLastAddedLetter({ row: 1, column: COLUMN_UNDEFINED });
        expect(gridService.coordinatesToPosition).not.toHaveBeenCalled();
    });

    it('should call coordinatesToPosition() on call of  drawBoarderOnLastAddedLetter() if the cordiantes are valid', () => {
        spyOn(service.gridService, 'coordinatesToPosition').and.returnValue({
            x: 8,
            y: 10,
        });
        service.drawBoarderOnLastAddedLetter({ row: 7, column: 5 });
        expect(gridService.coordinatesToPosition).toHaveBeenCalled();
    });

    it('should call moveto when arrowStart', () => {
        const arrowToDraw: ArrowToDraw = {
            boxCoordinates: { row: 6, column: 6 },
            direction: 'v',
            arrowStart: true,
            arrowEnd: false,
        };
        spyOn(service.gridContext, 'moveTo');
        service.drawArrowOnBox(arrowToDraw);
        expect(service.gridContext.moveTo).toHaveBeenCalled();
    });
});
