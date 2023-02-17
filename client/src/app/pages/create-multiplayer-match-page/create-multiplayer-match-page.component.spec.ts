/* eslint-disable */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DrawService } from '@app/services/draw-service/draw.service';
import { RoomService } from '@app/services/room-service/room.service';
import { FIFTY_SECONDS, FIVE_MIN_ONE_SEC, ONE_MINUTE, TWENTY_FIVE_SECONDS } from '@common/constants/constants';
import { Dictionary } from '@common/dictionary/dictionary';
import { of, throwError } from 'rxjs';
import { CreateMultiplayerMatchPageComponent } from './create-multiplayer-match-page.component';

describe('CreateMultiplayerMatchPageComponent', () => {
    let component: CreateMultiplayerMatchPageComponent;
    let roomService: RoomService;
    let fixture: ComponentFixture<CreateMultiplayerMatchPageComponent>;
    const testDictionary: Dictionary = {
        title: 'le petit dict',
        description: 'Le dictionaire de test',
        words: ['informatique', 'étude', 'lecture'],
    };
    const testDictionary1: Dictionary = {
        title: 'Mon dictionnaire',
        description: 'Le dictionaire de test',
        words: ['informatique', 'étude', 'lecture'],
    };
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    const communicationMock = {
        dictionaryGet: () => {
            return of(testDictionary);
        },
        dictionariesGet: () => {
            return of([testDictionary]);
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateMultiplayerMatchPageComponent],
            providers: [
                DrawService,
                HttpClient,
                HttpHandler,
                { provide: Router, useValue: routerMock },
                { provide: CommunicationService, useValue: communicationMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateMultiplayerMatchPageComponent);
        roomService = TestBed.inject(RoomService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize', () => {
        component.ngOnInit();
        expect(component.isNameInputValid).toBe(true);
        expect(component.isTimerInputValid).toBe(true);
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

    it('should not accept timer value under 30sec', () => {
        expect(component.isTimerParameterValid(TWENTY_FIVE_SECONDS)).toBe(false);
    });

    it('should not accept timer value over 5min', () => {
        expect(component.isTimerParameterValid(FIVE_MIN_ONE_SEC)).toBe(false);
    });

    it('should accept valid timer value', () => {
        expect(component.isTimerParameterValid(FIFTY_SECONDS)).toBe(true);
    });

    it('should not start game if timer invalid', () => {
        spyOn(component, 'startGame');
        component.parameterValidation('name', FIVE_MIN_ONE_SEC);
        expect(component.startGame).not.toHaveBeenCalled();
    });

    it('should call parameterValidation()', () => {
        spyOn(component, 'parameterValidation');
        component.parameterValidation('name', FIFTY_SECONDS);
        expect(component.parameterValidation).toHaveBeenCalled();
    });

    it('should call isNameParamterValid(), isTimerParameterValid', () => {
        spyOn(component, 'isNameParameterValid');
        spyOn(component, 'isTimerParameterValid');
        component.parameterValidation('name', FIFTY_SECONDS);
        expect(component.isNameParameterValid).toHaveBeenCalled();
        expect(component.isTimerParameterValid).toHaveBeenCalled();
    });

    it('should set the timer to ONE_MINUTE on call of parameterValidation() if timer is true', () => {
        component.isTimerInputValid = true;
        component.parameterValidation('name', ONE_MINUTE);
        expect(component.matchTime).toBe(ONE_MINUTE);
    });

    it('should call  startGame() on call of parameterValidation() if it subscribe', () => {
        component['selectedDictionary'] = testDictionary;
        spyOn(component, 'startGame');
        component.isTimerInputValid = true;
        component.parameterValidation('name', ONE_MINUTE);
        expect(component.startGame).toHaveBeenCalled();
    });

    it('should call  openDialog() on call of parameterValidation() if an error is throw', () => {
        component['selectedDictionary'] = testDictionary;
        spyOn(component, 'openDialog');
        const errorObs = throwError('Error Covid');
        spyOn(communicationMock, 'dictionaryGet').and.returnValue(errorObs);
        component.isTimerInputValid = true;
        component.parameterValidation('name', ONE_MINUTE);
        expect(component.openDialog).toHaveBeenCalled();
    });

    it('should set the dictionnary to the default dictionnary on refreshDictionariesList() if dict.title is Mon dictionnaire', () => {
        spyOn(roomService, 'startMultiPlayerGame');
        spyOn(communicationMock, 'dictionariesGet').and.returnValue(of([testDictionary1]));
        component.refreshDictionariesList();
        expect(component.selectedDictionary).toBe(testDictionary1);
    });

    it('should test startGame', () => {
        spyOn(roomService, 'startMultiPlayerGame');
        component.startGame('name');
        expect(roomService.startMultiPlayerGame).toHaveBeenCalled();
    });
});
