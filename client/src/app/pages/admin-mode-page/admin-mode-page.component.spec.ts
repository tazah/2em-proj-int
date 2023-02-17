/* eslint-disable */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-throw-literal */
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { BEGINNER_VIRTUAL_PLAYERS } from '@common/constants/constants';
import { Dictionary } from '@common/dictionary/dictionary';
import { VirtualPlayerLevel } from '@common/virtual-player-name/virtual-player-name';
import { of, throwError } from 'rxjs';
import { AdminModePageComponent } from './admin-mode-page.component';

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));
describe('AdminModePageComponent', () => {
    let component: AdminModePageComponent;

    let fixture: ComponentFixture<AdminModePageComponent>;
    const testDictionary: Dictionary = {
        title: 'le petit dict',
        description: 'Le dictionaire de test',
        words: ['informatique', 'étude', 'lecture'],
    };

    const testDictionary1: Dictionary = {
        title: 'le petit test',
        description: 'Le dictionaire test',
        words: ['informatique', 'hi', 'hello'],
    };
    const communicationMock = {
        dictionaryGet: () => {
            return of(testDictionary);
        },
        dictionariesGet: () => {
            return of([testDictionary]);
        },
        virtualPlayerNamesGet: () => {
            return of(BEGINNER_VIRTUAL_PLAYERS);
        },
        dictionaryDelete: () => {
            return of(null);
        },
        dictionaryPost: () => {
            return of(null);
        },
        dictionaryPut: () => {
            return of(null);
        },
        virtualPlayerNamePost: () => {
            return of(null);
        },
        virtualPlayerNameDelete: () => {
            return of(null);
        },
        virtualPlayerNameReset: () => {
            return of(null);
        },
        bestScoreReset: () => {
            return of(null);
        },
        dictionariesReset: () => {
            return of(null);
        },
        virtualPlayerNamePut: () => {
            return of(null);
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminModePageComponent],
            imports: [NoopAnimationsModule],
            providers: [HttpClient, HttpHandler, { provide: CommunicationService, useValue: communicationMock }, MatSnackBar, Overlay],
        }).compileComponents();
        // jasmine.clock().install();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminModePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        // jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change menu', () => {
        component.goTo('DictionaryList');
        expect(component.selectedMenu).toBe('DictionaryList');
    });

    it('should call openSnackBar() on call of deleteDictionaryByTitle()', () => {
        spyOn(component, 'openSnackBar');
        component.deleteDictionaryByTitle('dict');
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of deleteDictionaryByTitle() if an error is thrown', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'dictionaryDelete').and.returnValue(errorObs);
        component.dictionaryToUpload = testDictionary1;
        component.deleteDictionaryByTitle('dict');
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of onDictionaryUpload()', () => {
        spyOn(component, 'openSnackBar');
        component.dictionaryToUpload = testDictionary;
        component.onDictionaryUpload();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should openSnackBar() on call of onDictionaryUpload() if !isDictionaryAlreadyExistent', () => {
        spyOn(component, 'openSnackBar');
        component.dictionaryToUpload = testDictionary1;
        component.onDictionaryUpload();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of onDictionaryUpload() if an error is thrown', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'dictionaryPost').and.returnValue(errorObs);
        component.dictionaryToUpload = testDictionary1;
        component.onDictionaryUpload();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of refreshInfos() if an error is thrown by dictionariesGet ', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'dictionariesGet').and.returnValue(errorObs);
        component.refreshInfos();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar on call of refreshInfos() if an error is thrown by virtualPlayerNamesGet ', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'virtualPlayerNamesGet').and.returnValue(errorObs);
        component.refreshInfos();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should return true on call of isDictionaryAlreadyExistent() if the dictionary exists', () => {
        component.dataSourceDictionary.push(testDictionary);
        expect(component.isDictionaryAlreadyExistent(testDictionary)).toBe(true);
    });

    it('should return false on call of isDictionaryAlreadyExistent() if the dictionnary does not exist', () => {
        expect(component.isDictionaryAlreadyExistent(testDictionary1)).toBe(false);
    });

    it('should openSnackBar() on call of downloadDictionary() ', () => {
        spyOn(component, 'openSnackBar');
        component.downloadDictionary('hello');
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should openSnackBar() on call of downloadDictionary() case error ', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'dictionaryGet').and.returnValue(errorObs);
        component.downloadDictionary('hello');
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should set selectedDictionaryTitle to the new dictionary name passed on call of downloadDictionary()', () => {
        component.editDictionary({
            title: 'string',
            description: 'string',
        });
        expect(component['selectedDictionaryTitle']).toBe('string');
    });

    it('should call refreshInfos() on call of saveDictionary()', () => {
        spyOn(component, 'refreshInfos');
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl('test description'),
        });
        component.selectedDictionaryTitle = 'test';
        component.saveDictionary();
        expect(component.refreshInfos).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of saveDictionary() if an error is thrown', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'dictionaryPut').and.returnValue(errorObs);
        spyOn(component, 'refreshInfos');
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl('test description'),
        });
        component.selectedDictionaryTitle = 'test';
        component.saveDictionary();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of saveDictionary() if isDictionaryInfoValid is false', () => {
        spyOn(component, 'openSnackBar');
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl(' '),
        });
        component.selectedDictionaryTitle = 'test';
        component.saveDictionary();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of saveDictionary() if isDictionaryAlreadyExistent is true', () => {
        component.dataSourceDictionary.push(testDictionary);
        spyOn(component, 'openSnackBar');
        component.dictionary = new FormGroup({
            title: new FormControl('le petit dict'),
            description: new FormControl('Le dictionaire de test'),
        });
        component.selectedDictionaryTitle = 'le petit dict';
        component.saveDictionary();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call refreshInfos() on call of addVirtualPlayer() if the VirtualPlayerLevel is beginner ', () => {
        component.beginnerVirtualPlayerToUpload = 'tester';
        component.dataSourcePlayersExpert.push({
            name: 'hello',
        });
        component.dataSourcePlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'refreshInfos');
        component.addVirtualPlayer(component.beginnerVirtualPlayerToUpload, VirtualPlayerLevel.Beginner);
        expect(component.refreshInfos).toHaveBeenCalled();
    });

    it('should call refreshInfos() on call of addVirtualPlayer() if the VirtualPlayerLevel expert ', () => {
        component.expertVirtualPlayerToUpload = 'tester';
        component.dataSourcePlayersExpert.push({
            name: 'hello',
        });
        component.dataSourcePlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'refreshInfos');
        component.addVirtualPlayer(component.expertVirtualPlayerToUpload, VirtualPlayerLevel.Expert);
        expect(component.refreshInfos).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of addVirtualPlayer() if !isValidToAdd for beginner ', () => {
        component.beginnerVirtualPlayerToUpload = 'testeros';
        component.dataSourcePlayersExpert.push({
            name: 'testeros',
        });
        component.dataSourcePlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'openSnackBar');
        component.addVirtualPlayer(component.beginnerVirtualPlayerToUpload, VirtualPlayerLevel.Beginner);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of addVirtualPlayer() if !isValidToAdd for expert ', () => {
        component.expertVirtualPlayerToUpload = 'testeros';
        component.dataSourcePlayersExpert.push({
            name: 'testeros',
        });
        component.dataSourcePlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'openSnackBar');
        component.addVirtualPlayer(component.expertVirtualPlayerToUpload, VirtualPlayerLevel.Expert);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of addVirtualPlayer() if an error is thrown  ', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'openSnackBar');
        spyOn(communicationMock, 'virtualPlayerNamePost').and.returnValue(errorObs);
        component.expertVirtualPlayerToUpload = 'testeros';
        component.dataSourcePlayersExpert.push({
            name: 'testeros',
        });
        component.dataSourcePlayersBeginner.push({
            name: 'hi',
        });
        component.addVirtualPlayer(component.expertVirtualPlayerToUpload, VirtualPlayerLevel.Beginner);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should openSnackBar on call of deleteVirtualPlayer() if VirtualPlayerLevel is beginner', () => {
        component.dataSourcePlayersBeginner.push({
            name: 'testeros',
        });
        spyOn(component, 'openSnackBar');
        component.deleteVirtualPlayer({ name: 'testeros' }, VirtualPlayerLevel.Beginner);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should openSnackBar on call of deleteVirtualPlayer() if VirtualPlayerLevel is expert', () => {
        component.dataSourcePlayersExpert.push({
            name: 'testeratos',
        });
        spyOn(component, 'openSnackBar');
        component.deleteVirtualPlayer({ name: 'testeros' }, VirtualPlayerLevel.Expert);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call refreshInfos() on call of resetDefault() ', () => {
        component.dataSourcePlayersExpert.push({
            name: 'testeratos',
        });
        spyOn(component, 'refreshInfos');
        component.resetDefault();
        expect(component.refreshInfos).toHaveBeenCalled();
    });

    it('should call refreshInfos() on call of saveName() ', () => {
        component.editedName = 'hellotest';
        component.nameToEdit = { name: 'hola' };
        component.level = VirtualPlayerLevel.Expert;
        component.dataSourcePlayersExpert.push(component.nameToEdit);
        spyOn(component, 'refreshInfos');
        component.saveName();
        expect(component.refreshInfos).toHaveBeenCalled();
    });

    it('should return false on call of validateDictionary() if the dictionnary is not valid ', () => {
        const dict: JSON = testDictionary as unknown as JSON;
        expect(component.validateDictionary(dict)).toBe(false);
    });

    it('should return true on call of validateDictionary() if the dictionary is valid', () => {
        const dict: JSON = testDictionary1 as unknown as JSON;
        expect(component.validateDictionary(dict)).toBe(true);
    });

    it('should return false on call of isDefaultBeginnerName() if the name is not included in beginner name', () => {
        expect(component.isDefaultBeginnerName('tester')).toBe(false);
    });

    it('should return false on call of isDefaultBeginnerName() if the name is not included in expert name', () => {
        expect(component.isDefaultExpertName('tester')).toBe(false);
    });

    it('should set the dictionary to null on call of cancelDictionaryEdit()', () => {
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl('test description'),
        });
        component.cancelDictionaryEdit();
        expect(component.dictionary).toBe(null as unknown as FormGroup);
    });

    it('should call addVirtualPlayer on validateName() if name is valid', () => {
        component.beginnerVirtualPlayerToUpload = 'tester';
        spyOn(component, 'addVirtualPlayer');
        component.validateName(component.beginnerVirtualPlayerToUpload, VirtualPlayerLevel.Beginner);
        expect(component.addVirtualPlayer).toHaveBeenCalled();
    });

    it('should not call addVirtualPlayer on validateName() if name length under 3 ', () => {
        component.beginnerVirtualPlayerToUpload = 'te';
        spyOn(component, 'addVirtualPlayer');
        component.validateName(component.beginnerVirtualPlayerToUpload, VirtualPlayerLevel.Beginner);
        expect(component.addVirtualPlayer).not.toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of onDictionaryFileChanged() if validDictionary is false  ', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionary.push(testDictionary);
        const blob = new Blob(['{"key" : "Hello world"}']);
        const file: File = new File([blob], 'fileName');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: (index: number) => {
                if (index !== -1) return file;
                return null;
            },
        };
        event.currentTarget.files = fileList;
        spyOn(component, 'openSnackBar');
        component.dictionaryToUpload = testDictionary;
        component.onDictionaryFileChanged(event);
        await delay(1000);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of onDictionaryFileChanged() if validDictionary and isDictionaryAlreadyExistent  are true', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionary.push(testDictionary);
        const blob = new Blob(['{"key" : "Hello world"}']);
        const file: File = new File([blob], 'fileName');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: (index: number) => {
                if (index !== -1) return file;
                return null;
            },
        };
        event.currentTarget.files = fileList;
        spyOn(component, 'openSnackBar');
        spyOn(component, 'validateDictionary').and.returnValue(true);
        spyOn(component, 'isDictionaryAlreadyExistent').and.returnValue(true);
        component.dictionaryToUpload = testDictionary;
        component.onDictionaryFileChanged(event);
        await delay(1000);
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should call openSnackBar() on call of onDictionaryFileChanged() if validDictionary true and isDictionaryAlreadyExistent false', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionary.push(testDictionary);
        const blob = new Blob(['{"key" : "Hello world"}']);
        const file: File = new File([blob], 'fileName');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: (index: number) => {
                if (index !== -1) return file;
                return null;
            },
        };
        event.currentTarget.files = fileList;
        spyOn(component, 'openSnackBar');
        spyOn(component, 'validateDictionary').and.returnValue(true);
        spyOn(component, 'isDictionaryAlreadyExistent').and.returnValue(false);
        component.dictionaryToUpload = testDictionary;
        component.onDictionaryFileChanged(event);
        await delay(1000);
        expect(component.dictionaryToUpload).toBeDefined();
    });

    it('should call openSnackBar() on call of onDictionaryFileChanged() if validDictionary true and isDictionaryAlreadyExistent false', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionary.push(testDictionary);
        spyOn(component, 'refreshInfos');
        spyOn(component, 'validateDictionary').and.returnValue(true);
        spyOn(component, 'isDictionaryAlreadyExistent').and.returnValue(false);
        component.dictionaryToUpload = testDictionary;
        component.onDictionaryFileChanged(event);
        await delay(1000);
        expect(component.refreshInfos).toHaveBeenCalled();
    });
});
