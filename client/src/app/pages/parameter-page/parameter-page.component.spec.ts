/* eslint-disable dot-notation */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DrawService } from '@app/services/draw-service/draw.service';
import { FIFTY_SECONDS, FIVE_MIN_ONE_SEC, ONE_MINUTE, TWENTY_FIVE_SECONDS } from '@common/constants/constants';
import { Dictionary } from '@common/dictionary/dictionary';
import { of, throwError } from 'rxjs';
import { ParameterPageComponent } from './parameter-page.component';

describe('ParameterPageComponent', () => {
    let component: ParameterPageComponent;
    let fixture: ComponentFixture<ParameterPageComponent>;
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

    const communicationMock = {
        dictionaryGet: () => {
            return of(testDictionary);
        },
        dictionariesGet: () => {
            return of([testDictionary]);
        },
    };

    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [ParameterPageComponent],
            providers: [DrawService, { provide: CommunicationService, useValue: communicationMock }, { provide: Router, useValue: routerMock }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParameterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true on call of isNameParamterValid() function if the name is valid', () => {
        expect(component.isNameParameterValid('test1e')).toBe(true);
    });

    it('should return false on call of isNameParamterValid() if the name have more then 8 character', () => {
        expect(component.isNameParameterValid('testolololo')).toBe(false);
    });

    it('should return false on call of isNameParamterValid() if the name have less then 3 character', () => {
        expect(component.isNameParameterValid('te')).toBe(false);
    });

    it('should return false on call of isNameParamterValid() if the name have special character', () => {
        expect(component.isNameParameterValid('!t@st')).toBe(false);
    });

    it('should return false on call of isTimerParameterValid() if the time is under 30 seconds', () => {
        expect(component.isTimerParameterValid(TWENTY_FIVE_SECONDS)).toBe(false);
    });

    it('should return false on call of isTimerParameterValid() if the time is 5min and up', () => {
        expect(component.isTimerParameterValid(FIVE_MIN_ONE_SEC)).toBe(false);
    });

    it('should return true on call of isTimerParameterValid() with an accepted value', () => {
        expect(component.isTimerParameterValid(FIFTY_SECONDS)).toBe(true);
    });

    it('should call dictionaryGet() on call of  parameterValidation()', async () => {
        spyOn(communicationMock, 'dictionaryGet').and.callThrough();
        component['selectedDictionary'] = testDictionary;
        component.parameterValidation('name', FIFTY_SECONDS);
        expect(communicationMock.dictionaryGet).toHaveBeenCalled();
    });

    it('should call openDialog() on call of  parameterValidation() if an error is thrown', async () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openDialog');
        spyOn(communicationMock, 'dictionaryGet').and.returnValue(errorObs);
        component['selectedDictionary'] = testDictionary;
        component.parameterValidation('name', FIFTY_SECONDS);
        expect(component.openDialog).toHaveBeenCalled();
    });

    it('should set selectedDictionary to testDictionary1 on call of  refreshDictionariesList() if an error is thrown', async () => {
        spyOn(communicationMock, 'dictionariesGet').and.returnValue(of([testDictionary1]));
        component['refreshDictionariesList']();
        expect(component.selectedDictionary).toEqual(testDictionary1);
    });

    it('should call isNameParamterValid() on call of isNameParameterValid() ', () => {
        spyOn(component, 'isNameParameterValid');
        component.isNameParameterValid('name');
        expect(component.isNameParameterValid).toHaveBeenCalled();
    });

    it('should call isTimerParameterValid()', () => {
        spyOn(component, 'isTimerParameterValid');
        component.isTimerParameterValid(FIFTY_SECONDS);
        expect(component.isTimerParameterValid).toHaveBeenCalled();
    });

    it('should call isNameParamterValid() and isTimerParameterValid() on call of parameterValidation()', () => {
        spyOn(component, 'isNameParameterValid');
        spyOn(component, 'isTimerParameterValid');
        component.parameterValidation('name', FIFTY_SECONDS);
        expect(component.isNameParameterValid).toHaveBeenCalled();
        expect(component.isTimerParameterValid).toHaveBeenCalled();
    });

    it('should set match on ONE_MINUTE on call of parameterValidation() if time not valid', () => {
        component.parameterValidation('name', TWENTY_FIVE_SECONDS);
        expect(component.matchTime).toBe(ONE_MINUTE);
    });

    it('should set properly the params on call ofparameterValidation() if they are valid', () => {
        component.isTimerInputValid = true;
        component.parameterValidation('name', ONE_MINUTE);
        expect(component.matchTime).toBe(ONE_MINUTE);
    });
});
