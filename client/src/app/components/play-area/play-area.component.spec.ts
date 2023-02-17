import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LetterState } from '@app/classes/visual-letter-on-board/visual-letter-on-board';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let roomService: RoomService;
    let visualPlacementService: VisualPlacementService;
    let localGame: LocalGameHandlerService;
    let gridService: DrawService;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [LocalGameHandlerService, DrawService, RoomService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
        localGame = TestBed.inject(LocalGameHandlerService);
        roomService = TestBed.inject(RoomService);
        visualPlacementService = TestBed.inject(VisualPlacementService);
        gridService = TestBed.inject(DrawService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should send message on buttonDetect() if event key is ENTER', () => {
        const event: KeyboardEvent = { key: 'Enter' } as unknown as KeyboardEvent;
        visualPlacementService.positionSelectedBox = { row: 7, column: 7 };
        localGame.board[7][7].letter = 'a';
        spyOn(roomService, 'sendMessage');
        component.buttonDetect(event);
        expect(roomService.sendMessage).toHaveBeenCalled();
    });
    it('should not call keyTreatment() on buttonDetect() if event key is not ENTER', () => {
        const event: KeyboardEvent = { key: 'Escape' } as unknown as KeyboardEvent;
        visualPlacementService.positionSelectedBox = { row: -1, column: -1 };
        localGame.board[7][7].letter = 'a';
        spyOn(visualPlacementService, 'keyTreatment');
        component.buttonDetect(event);
        expect(visualPlacementService.keyTreatment).not.toHaveBeenCalled();
    });
    // it('should test abandonGame() case other', () => {
    //     spyOn(roomService, 'abandonGame');
    //     component.abandonGame();
    //     expect(roomService.abandonGame).toHaveBeenCalled();
    // });

    it('should call drawBoarderOnLastAddedLetter() on ngAfterViewChecked() ', () => {
        spyOn(gridService, 'drawBoarderOnLastAddedLetter');

        gridService.localGameHandler.match.gameOver = false;
        localGame.match.activePlayer = 1;
        visualPlacementService.wordToPlace.push({ letter: 'a', state: LetterState.WhiteLetter });
        component.ngAfterViewChecked();
        expect(gridService.drawBoarderOnLastAddedLetter).toHaveBeenCalled();
    });

    it('should not cancelPlacement if the event target is canvas', () => {
        spyOn(component.visualPlacementService, 'cancelPlacement');
        const event: MouseEvent = { button: 2, target: { id: 'canvas' } } as unknown as MouseEvent;
        component.clickDetect(event);
        expect(component.visualPlacementService.cancelPlacement).not.toHaveBeenCalled();
    });

    it('should cancelPlacement if the event target is not canvas', () => {
        spyOn(component.visualPlacementService, 'cancelPlacement');
        const event: MouseEvent = { button: 2, target: { id: 'container' } } as unknown as MouseEvent;
        component.clickDetect(event);
        expect(component.visualPlacementService.cancelPlacement).toHaveBeenCalled();
    });
});
