/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { MAX_TRAY_INDEX, SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED } from '@common/constants/constants';
import { VisualManipulationService } from './visual-manipulation.service';

describe('VisualManipulationService', () => {
    let service: VisualManipulationService;
    let localGame: LocalGameHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [VisualManipulationService, LocalGameHandlerService] });
        service = TestBed.inject(VisualManipulationService);
        localGame = TestBed.inject(LocalGameHandlerService);
        localGame.match.players[0].tray = ['a', 'b', 'c', 'd', 'e', 'a', 'g'];
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should call swapSelectedLetter() and extractSwapDirectionFromKey() when keypressed is ArrowLeft', () => {
        const keyPressed = 'ArrowLeft';
        spyOn<any>(service, 'extractSwapDirectionFromKey');
        spyOn<any>(service, 'swapSelectedLetter');
        service.keyTreatment(keyPressed);
        expect(service['extractSwapDirectionFromKey']).toHaveBeenCalled();
        expect(service['swapSelectedLetter']).toHaveBeenCalled();
    });
    it('should call swapSelectedLetter() and extractSwapDirectionFromKey() when keypressed is ArrowRight', () => {
        const keyPressed = 'ArrowRight';
        spyOn<any>(service, 'extractSwapDirectionFromKey');
        spyOn<any>(service, 'swapSelectedLetter');
        service.keyTreatment(keyPressed);
        expect(service['extractSwapDirectionFromKey']).toHaveBeenCalled();
        expect(service['swapSelectedLetter']).toHaveBeenCalled();
    });
    it('should call selectTileWithKey when keypressed is letteInTray', () => {
        service.selectedLettersForExchangeIndexes = [];
        spyOn<any>(service, 'selectTileWithKey');
        service.keyTreatment('a');
        expect(service['selectTileWithKey']).toHaveBeenCalled();
    });
    it('should not call selectTileWithKey when keypressed is not letterInTray', () => {
        service.selectedLettersForExchangeIndexes = [];
        spyOn<any>(service, 'selectTileWithKey');
        service.keyTreatment('z');
        expect(service['selectTileWithKey']).not.toHaveBeenCalled();
    });

    it('should set updateSelectedLettersForExchangeSelection on call of selectTileWithMouse() with left button ', () => {
        const mouseEvent: MouseEvent = { button: 0 } as unknown as MouseEvent;
        service.selectTileWithMouse(mouseEvent, 0);
        expect(service.selectedLetterForManipulationIndex).toBe(0);
    });

    it('should call updateSelectedLettersForExchangeSelection() on call of selectTileWithMouse() with right button ', () => {
        const mouseEvent: MouseEvent = { button: 2 } as unknown as MouseEvent;
        spyOn<any>(service, 'updateSelectedLettersForExchangeSelection');
        service.selectTileWithMouse(mouseEvent, 0);
        expect(service['updateSelectedLettersForExchangeSelection']).toHaveBeenCalled();
    });

    it('should call swapSelectedLetter  when wheelUp', () => {
        const wheelEvent: WheelEvent = { deltaY: 2 } as unknown as WheelEvent;
        spyOn<any>(service, 'swapSelectedLetter');
        service.swapLetterOnWheelAction(wheelEvent);
        expect(service['swapSelectedLetter']).toHaveBeenCalled();
    });

    it('should call swapSelectedLetter  when wheelDown', () => {
        const wheelEvent: WheelEvent = { deltaY: -1 } as unknown as WheelEvent;
        spyOn<any>(service, 'swapSelectedLetter');
        service.swapLetterOnWheelAction(wheelEvent);
        expect(service['swapSelectedLetter']).toHaveBeenCalled();
    });

    it('should return Left when keypressed is ArrowLeft', () => {
        const direction = service['extractSwapDirectionFromKey']('ArrowLeft');
        expect(direction).toBe('Left');
    });

    it('should return Right when keypressed is ArrowRight', () => {
        const direction = service['extractSwapDirectionFromKey']('ArrowRight');
        expect(direction).toBe('Right');
    });

    it('should return nothing  when keypressed is something else', () => {
        const direction = service['extractSwapDirectionFromKey']('z');
        expect(direction).toBe('');
    });

    it('should select the first occurrence of a', () => {
        service.selectedLetterForManipulationIndex = -1;
        service['selectTileWithKey']('a');
        expect(service.selectedLetterForManipulationIndex).toBe(0);
    });

    it('should select next occurrence of a', () => {
        service.selectedLetterForManipulationIndex = 0;
        service['selectTileWithKey']('a');
        expect(service.selectedLetterForManipulationIndex).toBe(MAX_TRAY_INDEX - 1);
    });

    it('should select next occurence of a case when occurrence > tray size', () => {
        service.selectedLetterForManipulationIndex = MAX_TRAY_INDEX - 1;
        service['selectTileWithKey']('a');
        expect(service.selectedLetterForManipulationIndex).toBe(0);
    });

    it('should swap left', () => {
        service.selectedLetterForManipulationIndex = 2;
        service['swapSelectedLetter']('Left');
        expect(localGame.match.players[0].tray[1]).toBe('c');
    });

    it('should swap right', () => {
        service.selectedLetterForManipulationIndex = 2;
        service['swapSelectedLetter']('Right');
        expect(localGame.match.players[0].tray[3]).toBe('c');
    });

    it('should update tray', () => {
        service.selectedLettersForExchangeIndexes = [0];
        service.selectedLetterForManipulationIndex = 1;
        service['swapSelectedLetter']('Left');
        expect(service.selectedLettersForExchangeIndexes[0]).toBe(1);
    });

    it('should remove index to selectedLettersForExchangeIndexes', () => {
        service.selectedLettersForExchangeIndexes = [0];
        service['updateSelectedLettersForExchangeSelection'](0);
        expect(service.selectedLettersForExchangeIndexes).toEqual([]);
    });

    it('should add index to selectedLettersForExchangeIndexes', () => {
        service.selectedLettersForExchangeIndexes = [];
        service['updateSelectedLettersForExchangeSelection'](0);
        expect(service.selectedLettersForExchangeIndexes[0]).toEqual(0);
    });

    it('should empty selectedLettersForExchangeIndex and selectlettersForManipulationIndex', () => {
        service.selectedLettersForExchangeIndexes = [0, 2];
        service.selectedLetterForManipulationIndex = 5;
        service.cancelSelection();
        expect(service.selectedLettersForExchangeIndexes).toEqual([]);
        expect(service.selectedLetterForManipulationIndex).toEqual(SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED);
    });

    it('should create exchange message', () => {
        service.selectedLettersForExchangeIndexes = [0, 2];
        const message = service.createExchangeCommand();
        expect(message).toEqual('!échanger ac');
    });

    it('should return when call  swapSelectedLetter when selectedLetterForManipulationIndex is -1', () => {
        spyOn<any>(service, 'updateSelectedLettersForExchangeIndexes');
        service.selectedLetterForManipulationIndex = SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED;
        service['swapSelectedLetter']('Right');
        expect(service['updateSelectedLettersForExchangeIndexes']).not.toHaveBeenCalled();
    });
});
