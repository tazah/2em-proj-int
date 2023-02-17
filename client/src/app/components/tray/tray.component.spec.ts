import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { VisualManipulationService } from '@app/services/visual-manipulation-service/visual-manipulation.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';
import { TrayComponent } from './tray.component';

describe('TrayComponent', () => {
    let component: TrayComponent;
    let fixture: ComponentFixture<TrayComponent>;

    let visualManipulationService: VisualManipulationService;
    let visualPlacementService: VisualPlacementService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TrayComponent],
            providers: [LocalGameHandlerService, DrawService],
        }).compileComponents();
        visualPlacementService = TestBed.inject(VisualPlacementService);
        visualManipulationService = TestBed.inject(VisualManipulationService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TrayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should cancelPlacement if clickInsideTray()', () => {
        spyOn(visualPlacementService, 'cancelPlacement');
        component.clickInsideTray();
        expect(visualPlacementService.cancelPlacement).toHaveBeenCalled();
    });
    it('should call swapLetterOnWheelAction() if onMouseWheel() is called', () => {
        const event: WheelEvent = { deltaY: 4, deltaMode: 0 } as unknown as WheelEvent;
        spyOn(visualManipulationService, 'swapLetterOnWheelAction');
        component.onMouseWheel(event);
        expect(visualManipulationService.swapLetterOnWheelAction).toHaveBeenCalled();
    });
    it('should cancelSelection if clickOutSideTray() is called', () => {
        spyOn(component.visualManipulationService, 'cancelSelection');
        component.clickOutSideTray();
        expect(component.visualManipulationService.cancelSelection).toHaveBeenCalled();
    });
});
