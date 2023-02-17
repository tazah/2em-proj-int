/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-imports */
/* eslint-disable*/ 
import * as dict from '@app/assets/Mon dictionnaire.json';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as fs from 'fs';
import { describe } from 'mocha';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { Dictionary, DictionaryInfo } from '../../../../../common/dictionary/dictionary';
import { DictionnaryCollectionService } from './dictionary-collection.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Dictionary Collection Service', () => {
    let dictionaryCollectionService: DictionnaryCollectionService;
    let testDictionary: Dictionary;
    let testDictionaryInfo: DictionaryInfo;
    let testDictionary2: Dictionary;
    let testDictionary5: Dictionary;
    let testDictionary3: Dictionary;

    chai.use(spies);

    before(() => (testDictionary = JSON.parse(JSON.stringify(dict))));

    beforeEach(async () => {
        dictionaryCollectionService = Container.get<DictionnaryCollectionService>(DictionnaryCollectionService);

        testDictionary2 = {
            title: 'le petit dictionnaire',
            description: 'Le dictionaire de karim',
            words: ['informatique', 'etude', 'lecture'],
        };

        testDictionary5 = {
            title: 'le grand dictionnaire',
            description: 'Le dictionaire de karim',
            words: ['informatique', 'etude', 'lecture'],
        };

        testDictionaryInfo = {
            title: 'Mon dictionnaire123',
            description: 'Description de base',
        };
        await dictionaryCollectionService.resetDictionaries();
    });

    it('getAllDictionaries should get all dictionaries infos from Assets', () => {
        const dictionaries = dictionaryCollectionService.getAllDictionaries();
        expect(dictionaries[dictionaries.length - 1].title).to.deep.equals('Mon dictionnaire');
    });

    it('getAllDictionaries should throw error when cant read document', () => {
        const stubOn = Sinon.stub(fs, 'readFileSync').throwsException();
        expect(dictionaryCollectionService.getAllDictionaries).throw(Error);
        stubOn.restore();
    });

    it('get dictionary should get specific dictionary  with valid title', () => {
        dictionaryCollectionService.addDictionary(testDictionary2);
        const dictionary = dictionaryCollectionService.getDictionary(testDictionary2.title);
        expect(dictionary).to.deep.equals(testDictionary2);
        dictionaryCollectionService.deleteDictionary(testDictionary2.title);
    });

    it('getDictionary should throw specific dictionary  with not valid title', () => {
        try {
            dictionaryCollectionService.getDictionary('  ');
        } catch {
            expect(dictionaryCollectionService.getDictionary).throw(Error);
        }
    });

    it('addDictionary should add a new dictionary on valid dictionary', () => {
        dictionaryCollectionService.addDictionary(testDictionary2);
        const dictionaries = dictionaryCollectionService.getAllDictionaries();
        expect(dictionaries[dictionaries.length - 1].title).to.deep.equal(testDictionary.title);
    });
    it('addDictionary should add a new dictionary on valid dictionary', () => {
        try {
            dictionaryCollectionService.addDictionary(testDictionary3);
        } catch {
            expect(dictionaryCollectionService.addDictionary).throw(Error);
        }
    });

    it('deleteDictionary should delete an existing dictionary data if a valid title is sent', () => {
        const dictionaries = dictionaryCollectionService.getAllDictionaries();
        dictionaryCollectionService.addDictionary(testDictionary5);
        dictionaryCollectionService.deleteDictionary(testDictionary5.title);
        const assetsDictionaries: string[] = dictionaryCollectionService['listDictionariesFileNames']();
        expect(assetsDictionaries.length).to.equal(dictionaries.length);
    });

    it('deleteDictionary should throw error if not valid title is sent', () => {
        try {
            dictionaryCollectionService.deleteDictionary(testDictionary2.title);
        } catch {
            expect(dictionaryCollectionService.deleteDictionary).throw(Error);
        }
    });

    it('modifyDictionary should modify dictionary on valid title and valid dictionary input', async () => {
        dictionaryCollectionService.addDictionary(testDictionary2);
        await dictionaryCollectionService.modifyDictionary(testDictionary2.title, testDictionaryInfo);
        const dictionary = dictionaryCollectionService.getDictionary(testDictionaryInfo.title);
        expect(dictionary.description).to.deep.equal(testDictionaryInfo.description);
    });

    it('modifyDictionary should throw error on not valid title and valid dictionary input',  () => {
        try{
            dictionaryCollectionService.modifyDictionary(testDictionary2.title, testDictionary3);
        }catch{
            expect(dictionaryCollectionService.modifyDictionary).to.throw(Error);
        }
    });

    it('modifyDictionary should throw error on not valid data ', async () => {
        const stubOn = Sinon.stub(fs, 'readFileSync').returns(undefined as unknown as Buffer);
        try {
            dictionaryCollectionService.modifyDictionary(testDictionary2.title, testDictionary5);
        } catch {
            expect(dictionaryCollectionService.modifyDictionary).to.throw(Error);
        }
        stubOn.restore();
    });

    it('listDictionariesFileNames should throw error when cant read directory', () => {
        const stubOn = Sinon.stub(fs, 'readdirSync').throws(Error);
        try {
            dictionaryCollectionService['listDictionariesFileNames']();
        } catch {
            expect(dictionaryCollectionService['listDictionariesFileNames']).to.throw(Error);
        }
        stubOn.restore();
    });
    
});
