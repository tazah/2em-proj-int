/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { LetterState } from '@app/classes/visual-letter-on-board/visual-letter-on-board';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { COLUMN_UNDEFINED, ROW_UNDEFINED } from '@common/constants/constants';
import { Coordinates } from '@common/coordinates/coordinates';
import { GridService } from './../grid-service/grid.service';
import { VisualPlacementService } from './visual-placement.service';

describe('VisualPlacementService', () => {
    let service: VisualPlacementService;
    let localGame: LocalGameHandlerService;
    let gridService: GridService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [VisualPlacementService, LocalGameHandlerService, DrawService] });
        service = TestBed.inject(VisualPlacementService);
        localGame = TestBed.inject(LocalGameHandlerService);
        gridService = TestBed.inject(GridService);
        localGame.match.players[0].tray = ['a', 'b', 'c', 'd', 'e', 'a', 'g'];
        service.positionSelectedBox = { column: 7, row: 7 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should initialize visualPlacement', () => {
        service.initializeVisualPlacement();
        expect(service.wordToPlace).toEqual([]);
        expect(service.direction).toEqual('h');
        expect(service.positionSelectedBox).toEqual({ column: COLUMN_UNDEFINED, row: ROW_UNDEFINED });
    });
    it('should call removeLetterFromBoard', () => {
        spyOn<any>(service, 'removeLetterFromBoard');
        service.keyTreatment('Backspace');
        expect(service['removeLetterFromBoard']).toHaveBeenCalled();
    });
    it('should call placeValidKey', () => {
        spyOn<any>(service, 'placeValidKey');
        service.keyTreatment('a');
        expect(service['placeValidKey']).toHaveBeenCalled();
    });
    it('should call not placeValidKey when opponent turn', () => {
        spyOn<any>(service, 'placeValidKey');
        localGame.match.activePlayer = 1;
        service.keyTreatment('a');
        expect(service['placeValidKey']).not.toHaveBeenCalled();
    });

    it('should call placeWhiteKey', () => {
        spyOn<any>(service, 'placeWhiteKey');
        localGame.match.players[0].tray = ['a', 'b', 'c', 'd', 'e', 'a', '*'];
        service.keyTreatment('E');
        expect(service['placeWhiteKey']).toHaveBeenCalled();
    });
    it('should call cancelPlacement', () => {
        spyOn(service, 'cancelPlacement');
        service.keyTreatment('Escape');
        expect(service.cancelPlacement).toHaveBeenCalled();
    });
    it('should not call cancelPlacement', () => {
        spyOn(service, 'cancelPlacement');
        service.keyTreatment('6');
        expect(service.cancelPlacement).not.toHaveBeenCalled();
    });
    it('should call placeLetterInBox ', () => {
        spyOn<any>(service, 'placeLetterInBox');
        service['placeValidKey']('a');
        expect(service['placeLetterInBox']).toHaveBeenCalled();
    });
    it('should call placeLetterInBox  if direction vertical', () => {
        service.direction = 'v';
        spyOn<any>(service, 'placeLetterInBox');
        service['placeValidKey']('a');
        expect(service['placeLetterInBox']).toHaveBeenCalled();
    });
    it('should call placeLetterInBox  if direction vertical', () => {
        service.direction = 'v';
        service.positionSelectedBox = { column: 15, row: 15 };
        spyOn<any>(service, 'placeLetterInBox');
        service['placeValidKey']('a');
        expect(service['placeLetterInBox']).not.toHaveBeenCalled();
    });
    it('should call placeLetterInBox  with white key', () => {
        spyOn<any>(service, 'placeLetterInBox');
        service['placeWhiteKey']('a');
        expect(service['placeLetterInBox']).toHaveBeenCalled();
    });
    it('should call placeLetterInBox  if direction vertical with white key', () => {
        service.direction = 'v';
        spyOn<any>(service, 'placeLetterInBox');
        service['placeWhiteKey']('a');
        expect(service['placeLetterInBox']).toHaveBeenCalled();
    });
    it('should call placeLetterInBox  if direction vertical with white key', () => {
        service.direction = 'v';
        service.positionSelectedBox = { column: 15, row: 15 };
        spyOn<any>(service, 'placeLetterInBox');
        service['placeWhiteKey']('a');
        expect(service['placeLetterInBox']).not.toHaveBeenCalled();
    });

    it('should remove nothing', () => {
        service.positionSelectedBox = { column: 7, row: 7 };
        localGame.match.players[0].tray = ['a', 'b', 'c', 'd', 'e'];
        service['removeLetterFromBoard']('h');
        expect(service.wordToPlace.length).toEqual(0);
    });
    it('should remove letter from board', () => {
        service.positionSelectedBox = { column: 7, row: 7 };
        localGame.match.players[0].tray = ['a', 'b', 'c', 'd', 'e'];
        localGame.board[7][7].letter = 'a';
        service.wordToPlace.push({ letter: 'a', state: LetterState.PlacedOnBoard });
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        service['removeLetterFromBoard']('h');
        expect(service.wordToPlace.length).toEqual(0);
    });
    it('should remove white letter from board', () => {
        service.positionSelectedBox = { column: 7, row: 7 };
        localGame.match.players[0].tray = ['a', 'b', 'c', 'd', 'e'];
        localGame.board[7][7].letter = 'a';
        service.wordToPlace.push({ letter: 'a', state: LetterState.WhiteLetter });
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });

        service['removeLetterFromBoard']('v');
        expect(service.wordToPlace.length).toEqual(0);
    });

    it('should place letter in board when direction = h ', () => {
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        localGame.board[7][7].letter = 'a';
        service['placeLetterInBox']('a', { row: 7, column: 7 }, 'Valid');
        expect(service.wordToPlace.length).toEqual(3);
    });
    it('should place letter in board when direction = v ', () => {
        service.direction = 'v';
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        localGame.board[7][7].letter = 'a';
        service['placeLetterInBox']('a', { row: 7, column: 7 }, 'Valid');
        expect(service.wordToPlace.length).toEqual(3);
    });
    it('should place white letter in board when direction = h ', () => {
        service['placeLetterInBox']('a', { row: 7, column: 7 }, 'White');
        expect(service.wordToPlace.length).toEqual(1);
    });
    it('should place white letter in board when direction = v ', () => {
        service.direction = 'v';
        service['placeLetterInBox']('a', { row: 7, column: 7 }, 'White');
        expect(service.wordToPlace.length).toEqual(1);
    });

    it('should call selectBox ', () => {
        service.direction = 'v';
        localGame.match.activePlayer = 0;
        service.positionSelectedBox = { row: 7, column: 7 };
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        service.selectBox({ x: 305, y: 335 });
        expect(service.positionSelectedBox).toEqual({ row: 7, column: 7 });
    });
    it('should call positionToCoordinates ', () => {
        spyOn(gridService, 'positionToCoordinates');
        service.direction = 'v';
        localGame.match.activePlayer = 1;
        service.positionSelectedBox = { row: 7, column: 7 };
        service.selectBox({ x: 305, y: 335 });
        expect(gridService.positionToCoordinates).not.toHaveBeenCalled();
    });
    it('expect  positionSelectedBox) toEqual { row: 7, column: 7 } when direction is v', () => {
        service.direction = 'v';
        localGame.match.activePlayer = 0;
        service.positionSelectedBox = { row: 7, column: 7 };
        service.wordToPlace = [];
        service.selectBox({ x: 305, y: 335 });
        expect(service.positionSelectedBox).toEqual({ row: 7, column: 7 });
    });
    it('expect  positionSelectedBox) toEqual { row: 7, column: 7 } when direction is h', () => {
        localGame.match.activePlayer = 0;
        service.positionSelectedBox = { row: 7, column: 7 };
        service.wordToPlace = [];
        service.selectBox({ x: 305, y: 335 });
        expect(service.positionSelectedBox).toEqual({ row: 7, column: 7 });
    });
    it('expect  positionSelectedBox) toEqual { row: 7, column: 7 } when not already selected', () => {
        service.direction = 'v';
        localGame.match.activePlayer = 0;
        service.positionSelectedBox = { row: 6, column: 7 };
        service.wordToPlace = [];
        service.selectBox({ x: 305, y: 335 });
        expect(service.positionSelectedBox).toEqual({ row: 7, column: 7 });
    });
    it('should not detect next empty box', () => {
        service.positionSelectedBox = { row: -1, column: -1 };
        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toEqual({ row: -1, column: -1 });
    });
    /* it('should not detect next empty box when box is not empty', () => {
        localGame.board[7][7].letter = 'a';
        service.positionSelectedBox = { row: 7, column: 7 };
        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toEqual({ row: -1, column: -1 });
    });*/
    it('should  detect next empty box if direction is h ', () => {
        localGame.board[7][7].letter = '';
        service.positionSelectedBox = { row: 7, column: 7 };
        service.direction = 'h';

        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toBeDefined();
    });
    it('should  detect next empty box if direction is v ', () => {
        localGame.board[7][7].letter = '';
        service.positionSelectedBox = { row: 7, column: 7 };
        service.direction = 'v';
        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toBeDefined();
    });
    it('should  detect next empty box if direction is h ', () => {
        localGame.board[10][10].letter = 'b';
        service.positionSelectedBox = { row: 10, column: 10 };

        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toBeDefined();
    });
    it('should not detect next empty box', () => {
        localGame.board[14][14].letter = 'a';
        service.positionSelectedBox = { row: 14, column: 14 };
        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toEqual({ row: -1, column: -1 });
    });
    it('should not detect next empty box', () => {
        service.direction = 'v';
        localGame.board[14][14].letter = 'a';
        service.positionSelectedBox = { row: 14, column: 14 };
        const coords: Coordinates = service.detectNextEmptyBox();
        expect(coords).toEqual({ row: -1, column: -1 });
    });
    it('should  return index of a in worToPlace ', () => {
        localGame.match.activePlayer = 0;
        service.wordToPlace.push({ letter: 'a', state: LetterState.PlacedOnBoard });
        const index = service['detectLastAddedLetterIndex']();
        expect(index).toEqual(0);
    });
    it('should  return index of a in worToPlace ', () => {
        localGame.match.activePlayer = 0;
        service.wordToPlace.push({ letter: 'a', state: LetterState.WhiteLetter });
        const index = service['detectLastAddedLetterIndex']();
        expect(index).toEqual(0);
    });
    it('should not return index -1 ', () => {
        localGame.match.activePlayer = 0;
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        const index = service['detectLastAddedLetterIndex']();
        expect(index).toEqual(ROW_UNDEFINED);
    });
    it('should call detectLastAddedLetterIndex ', () => {
        localGame.match.activePlayer = 0;
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        spyOn<any>(service, 'detectLastAddedLetterIndex');
        service.detectCoordinatesLastAddedLetter();
        expect(service['detectLastAddedLetterIndex']).toHaveBeenCalled();
    });
    it('should not return { row: -1, column: -1 }', () => {
        localGame.match.activePlayer = 0;
        service.wordToPlace.push({ letter: 'a', state: LetterState.WasAlreadyOnBoard });
        const coordinates = service.detectCoordinatesLastAddedLetter();
        expect(coordinates).toEqual({ row: -1, column: -1 });
    });
    it('should not return { row: 7, column: 7 }', () => {
        localGame.match.activePlayer = 0;
        service.direction = 'v';
        service.positionSelectedBox = { row: 7, column: 7 };
        service.wordToPlace.push({ letter: 'a', state: LetterState.PlacedOnBoard });
        const coordinates = service.detectCoordinatesLastAddedLetter();
        expect(coordinates).toEqual({ row: 8, column: 8 });
    });
    it('should create place message command ', () => {
        spyOn<any>(service, 'pickFinalWordToPlace');
        localGame.match.activePlayer = 0;
        service.positionSelectedBox = { row: 7, column: 7 };

        localGame.board[7][7].letter = 'a';
        localGame.board[7][8].letter = 'b';
        service.createPlacementCommand();
        expect(service['pickFinalWordToPlace']).toHaveBeenCalled();
    });
    it('should create place message command ', () => {
        spyOn<any>(service, 'pickFinalWordToPlace');
        service.direction = 'v';
        service.positionSelectedBox = { row: 7, column: 7 };
        localGame.board[6][7].letter = 'c';
        localGame.board[7][7].letter = 'a';
        localGame.board[8][7].letter = 'b';
        localGame.match.activePlayer = 0;
        service.createPlacementCommand();
        expect(service['pickFinalWordToPlace']).toHaveBeenCalled();
    });
    it('should call findPrefixMaxIndex() and findSuffixMaxIndex() when direction h ', () => {
        spyOn<any>(service, 'findSuffixMaxIndex');
        spyOn<any>(service, 'findPrefixMaxIndex');
        service.positionSelectedBox = { row: 7, column: 7 };
        localGame.board[7][6].letter = 'c';
        localGame.board[7][7].letter = 'a';
        localGame.board[7][8].letter = 'b';
        service['pickFinalWordToPlace']();
        expect(service['findSuffixMaxIndex']).toHaveBeenCalled();
        expect(service['findPrefixMaxIndex']).toHaveBeenCalled();
    });

    it('should return word to place', () => {
        service.direction = 'v';
        service.positionSelectedBox = { row: 7, column: 7 };
        localGame.board[6][7].letter = 'c';
        localGame.board[7][7].letter = 'a';
        localGame.board[8][7].letter = 'b';
        const word = service['pickFinalWordToPlace']();

        expect(word).toEqual('cab');
    });
    it('should return word to place', () => {
        service.positionSelectedBox = { row: 7, column: 7 };
        localGame.board[7][6].letter = 'c';
        localGame.board[7][7].letter = 'a';
        localGame.board[7][8].letter = 'b';
        const word = service['pickFinalWordToPlace']();

        expect(word).toEqual('cab');
    });
    it('should cancelPlacement ', () => {
        localGame.board[7][7].letter = 'a';
        service.positionSelectedBox = { row: 7, column: 7 };
        service.wordToPlace.push({ letter: 'a', state: LetterState.PlacedOnBoard });
        service.cancelPlacement();
        expect(service.positionSelectedBox).toEqual({ row: -1, column: -1 });
    });
});
