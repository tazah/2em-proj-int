import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DrawService } from '@app/services/draw-service/draw.service';
import { RoomService } from '@app/services/room-service/room.service';
import { INDEX_NOT_FOUND } from '@common/constants/constants';
import { SecondPlayerParametersPageComponent } from './second-player-parameters-page.component';

describe('SecondPlayerParametersPageComponent', () => {
    let component: SecondPlayerParametersPageComponent;
    let fixture: ComponentFixture<SecondPlayerParametersPageComponent>;
    let roomService: RoomService;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SecondPlayerParametersPageComponent],
            providers: [DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
        roomService = TestBed.inject(RoomService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SecondPlayerParametersPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize', () => {
        component.ngOnInit();
        expect(component.isNameInputValid).toBe(true);
    });

    it('should accept name (case: valid name)', () => {
        expect(component.isNameParameterValid('test1e')).toBe(true);
    });

    it('should not accept name (case: name >8 characters)', () => {
        expect(component.isNameParameterValid('testlength')).toBe(false);
    });

    it('should not accept name (case: name <3 characters)', () => {
        expect(component.isNameParameterValid('te')).toBe(false);
    });

    it('should call parameterValidation()', () => {
        spyOn(component, 'parameterValidation');
        component.parameterValidation('name');
        expect(component.parameterValidation).toHaveBeenCalled();
    });

    it('should call isNameParamterValid() on call of parameterValidation() ', () => {
        spyOn(component, 'isNameParameterValid');
        component.parameterValidation('name');
        expect(component.isNameParameterValid).toHaveBeenCalled();
    });

    it('should not call joinGame() on call of parameterValidation() if isMatchAvailable is false', () => {
        component.isNameInputValid = true;
        component.isSameName = false;
        component.isMatchAvailable = false;
        roomService.availableRooms.push({ roomId: 0, creatorName: 'test', dictionaryUsed: 'Mon Dictionnaire', timerUsed: 60, isRandomModeOn: false });
        component.parameterValidation('name');
        expect(roomService.selectedRoom).toEqual(INDEX_NOT_FOUND);
    });

    it('should call joinGame() on call of parameterValidation() if isNameInputValid and !isSameName  isMatchAvailable', () => {
        component.isNameInputValid = true;
        component.isSameName = false;
        component.isMatchAvailable = true;
        roomService.selectedRoom = 0;
        roomService.availableRooms.push({ roomId: 0, creatorName: 'test', dictionaryUsed: 'Mon Dictionnaire', timerUsed: 60, isRandomModeOn: false });
        spyOn(component, 'joinGame');
        component.parameterValidation('name');
        expect(component.joinGame).toHaveBeenCalled();
    });

    it('should call initializeGameModeMultiPlayer() on call ofjoinGame()', () => {
        spyOn(roomService, 'initializeGameModeMultiPlayer');
        component.joinGame();
        expect(roomService.initializeGameModeMultiPlayer).toHaveBeenCalled();
    });

    it('should set the selectedRoom to indexNotFound on call of cancelJoin()', () => {
        component.cancelJoin();
        expect(roomService.selectedRoom).toEqual(INDEX_NOT_FOUND);
    });
});
