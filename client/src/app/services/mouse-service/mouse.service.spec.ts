/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2/vec2';
import { DrawService } from '@app/services/draw-service/draw.service';
import { MouseService } from '@app/services/mouse-service/mouse.service';
import { RANDOM_OFFSET } from '@common/constants/constants';

describe('MouseService', () => {
    let service: MouseService;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DrawService],
        });
        service = TestBed.inject(MouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseHitDetect should assign the mouse position to mousePosition variable', () => {
        const expectedPosition: Vec2 = { x: 100, y: 200 };
        mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
            button: 0,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service['mousePosition']).toEqual(expectedPosition);
    });

    it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
        const expectedPosition: Vec2 = { x: 0, y: 0 };
        mouseEvent = {
            offsetX: expectedPosition.x + RANDOM_OFFSET,
            offsetY: expectedPosition.y + RANDOM_OFFSET,
            button: 1,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service['mousePosition']).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(service['mousePosition']).toEqual(expectedPosition);
    });
});
