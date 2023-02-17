import { Component, HostListener, Input } from '@angular/core';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { VisualManipulationService } from '@app/services/visual-manipulation-service/visual-manipulation.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';

@Component({
    selector: 'app-tray',
    templateUrl: './tray.component.html',
    styleUrls: ['./tray.component.scss'],
})
export class TrayComponent {
    @Input() fontSize = 1;
    tray: string[];

    constructor(
        public localGameHandler: LocalGameHandlerService,
        public visualManipulationService: VisualManipulationService,
        public visualPlacementService: VisualPlacementService,
    ) {
        this.tray = this.localGameHandler.match.players[0].tray;
    }

    @HostListener('document:mousedown')
    clickOutSideTray() {
        this.visualManipulationService.cancelSelection();
    }

    @HostListener('click', ['$event'])
    clickInsideTray() {
        this.visualPlacementService.cancelPlacement();
    }

    @HostListener('mousewheel', ['$event'])
    onMouseWheel(event: WheelEvent) {
        this.visualManipulationService.swapLetterOnWheelAction(event);
    }
}
