import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DrawService } from '@app/services/draw-service/draw.service';
import { RoomService } from '@app/services/room-service/room.service';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let roomService: RoomService;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            providers: [DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
        roomService = TestBed.inject(RoomService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call leaveWaitingRoom() on call of abandonWaitingRoom() ', () => {
        spyOn(roomService, 'leaveWaitingRoom');
        component.abandonWaitingRoom();
        expect(roomService.leaveWaitingRoom).toHaveBeenCalled();
    });
});
