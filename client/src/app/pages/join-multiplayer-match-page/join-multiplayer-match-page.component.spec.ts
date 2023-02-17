/* eslint-disable  */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DrawService } from '@app/services/draw-service/draw.service';
import { RoomService } from '@app/services/room-service/room.service';
import { JoinMultiplayerMatchPageComponent } from './join-multiplayer-match-page.component';

describe('JoinMultiplayerMatchPageComponent', () => {
    let component: JoinMultiplayerMatchPageComponent;
    let fixture: ComponentFixture<JoinMultiplayerMatchPageComponent>;
    let roomService: RoomService;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinMultiplayerMatchPageComponent],
            providers: [DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
        roomService = TestBed.inject(RoomService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinMultiplayerMatchPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call navigateByUrl() on call of chooseRandomGame()', () => {
        component.existingMatches = [
            {
                roomId: 0,
                creatorName: 'hola',
                dictionaryUsed: 'dictionnaire1',
                timerUsed: 60,
                isRandomModeOn: true,
            },
        ];
        spyOn(component['router'], 'navigateByUrl');

        component.roomService.availableRooms.push({
            roomId: 1,
            creatorName: 'tes',
            dictionaryUsed: 'test',
            timerUsed: 1,
            isRandomModeOn: false,
        });
        component.roomService.availableRooms.push({
            roomId: 2,
            creatorName: 'test',
            dictionaryUsed: 'test',
            timerUsed: 1,
            isRandomModeOn: false,
        });
        component.chooseRandomGame();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });
    it('should select the right room on call of selectRoom()', () => {
        component.existingMatches = [
            {
                roomId: 2,
                creatorName: 'hola',
                dictionaryUsed: 'dictionnaire1',
                timerUsed: 60,
                isRandomModeOn: true,
            },
        ];
        component.selectRoom(1);

        expect(roomService.selectedRoom).toBe(1);
    });
});
