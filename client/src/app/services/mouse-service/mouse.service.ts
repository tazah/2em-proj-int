import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2/vec2';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    private mousePosition: Vec2;
    constructor(private visualPlacementService: VisualPlacementService) {
        this.mousePosition = { x: 0, y: 0 };
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.visualPlacementService.selectBox(this.mousePosition);
        }
    }
}
