import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { LetterToDraw } from '@app/classes/letter-to-draw/letter-to-draw';
import { Vec2 } from '@app/classes/vec2/vec2';
import { DrawService } from '@app/services/draw-service/draw.service';
import { MouseService } from '@app/services/mouse-service/mouse.service';
import { RoomService } from '@app/services/room-service/room.service';
import { VisualManipulationService } from '@app/services/visual-manipulation-service/visual-manipulation.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';
import { ChatAuthor } from '@common/chat/chat';
import {
    CANVAS_ROW_POSITION_X_AXIS,
    CANVAS_ROW_POSITION_Y_AXIS,
    COLUMN_UNDEFINED,
    DEFAULT_HEIGHT,
    DEFAULT_INDEX_COLUMN_HEIGHT,
    DEFAULT_INDEX_COLUMN_WIDTH,
    DEFAULT_INDEX_LINE_HEIGHT,
    DEFAULT_INDEX_LINE_WIDTH,
    DEFAULT_WIDTH,
    ENTER,
    ROW_UNDEFINED,
} from '@common/constants/constants';
import { ArrowToDraw } from './../../../../../common/arrow-to-draw/arrow-to-draw';
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, AfterViewChecked {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('lineCanvas', { static: false }) private lineCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('columnCanvas', { static: false }) private columnCanvas!: ElementRef<HTMLCanvasElement>;

    fontSize: number;
    mousePosition: Vec2;
    boxPosition: Vec2;
    buttonPressed: string;
    system: ChatAuthor;
    isTryingAbandon: boolean;
    canvasSize: Vec2;
    columnIndexCanvasSize: Vec2;
    lineIndexCanvasSize: Vec2;

    constructor(
        public drawService: DrawService,
        public mouseService: MouseService,
        public roomService: RoomService,
        public visualPlacementService: VisualPlacementService,
        public visualManipulationService: VisualManipulationService,
    ) {
        this.fontSize = 3;
        this.mousePosition = { x: 0, y: 0 };
        this.boxPosition = { x: 0, y: 0 };
        this.buttonPressed = '';
        this.system = ChatAuthor.System;
        this.isTryingAbandon = false;
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
        this.columnIndexCanvasSize = { x: DEFAULT_INDEX_COLUMN_HEIGHT, y: DEFAULT_INDEX_COLUMN_WIDTH };
        this.lineIndexCanvasSize = { x: DEFAULT_INDEX_LINE_HEIGHT, y: DEFAULT_INDEX_LINE_WIDTH };
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key.toString() === ENTER) {
            this.roomService.sendMessage(this.visualPlacementService.createPlacementCommand());
        }
        const isPlacementPossible =
            this.visualPlacementService.positionSelectedBox.column === COLUMN_UNDEFINED ||
            this.visualPlacementService.positionSelectedBox.row === ROW_UNDEFINED;
        if (isPlacementPossible) {
            this.visualManipulationService.keyTreatment(event.key.toString());
        } else this.visualPlacementService.keyTreatment(event.key.toString());
    }

    @HostListener('document:click', ['$event'])
    clickDetect(event: MouseEvent) {
        const isCanvas = (event.target as HTMLElement).id === 'canvas';

        if (!isCanvas) this.visualPlacementService.cancelPlacement();
    }

    ngAfterViewInit(): void {
        this.isTryingAbandon = false;
        this.drawService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawService.gridContext.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        this.drawService.drawGrid();
        this.drawService.initializeBoardBoxes(this.fontSize);
        this.drawService.gridContext = this.lineCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawService.drawNumbers('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');
        this.drawService.gridContext = this.columnCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const letterToDraw: LetterToDraw = {
            word: 'A B C D E F G H I J K L M N O',
            startPosition: { x: 9, y: 25 },
            step: CANVAS_ROW_POSITION_X_AXIS,
            size: CANVAS_ROW_POSITION_Y_AXIS,
            direction: 'V',
        };
        this.drawService.drawLetters(letterToDraw);
        this.drawService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCanvas.nativeElement.focus();
    }

    ngAfterViewChecked(): void {
        this.drawService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawService.gridContext.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        this.drawService.drawGrid();
        this.drawService.initializeBoardBoxes(this.fontSize);
        const nextEmptyBox = this.visualPlacementService.detectNextEmptyBox();
        const isMyTurn = this.drawService.localGameHandler.match.activePlayer === 0;
        const isAllowedToDrawArrow: boolean = isMyTurn && !this.drawService.localGameHandler.match.gameOver;
        const arrowToDraw: ArrowToDraw = {
            boxCoordinates: nextEmptyBox,
            direction: this.visualPlacementService.direction,
            arrowStart: false,
            arrowEnd: true,
        };
        if (isAllowedToDrawArrow) this.drawService.drawArrowOnBox(arrowToDraw);
        const startedPlacementAndGameNotOver = this.visualPlacementService.wordToPlace.length && !this.drawService.localGameHandler.match.gameOver;
        if (startedPlacementAndGameNotOver)
            this.drawService.drawBoarderOnLastAddedLetter(this.visualPlacementService.detectCoordinatesLastAddedLetter());
        this.gridCanvas.nativeElement.focus();
    }
}
