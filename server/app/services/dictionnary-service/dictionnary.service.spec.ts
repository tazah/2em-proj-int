/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable prettier/prettier */
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { DictionnaryService } from './dictionnary.service';

describe('DictionnaryService', () => {
    let service: DictionnaryService;

    chai.use(spies);

    beforeEach(async () => {
        service = Container.get(DictionnaryService);
    });

    afterEach(async () => {
        chai.spy.restore();
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(DictionnaryService);
    });

    it('should find matching words in word list', () => {
        const beginsWithT = new RegExp('^t');
        const expectedMatches = 'test';
        service.wordList = ['test', 'table'];
        service.findValidWordsMatching(beginsWithT);
        expect(service.findValidWordsMatching(beginsWithT)).to.contain(expectedMatches);
    });

    it('should call loadDictionary on valid dictionaryTitle', () => {
        chai.spy.on(service, 'loadDictionnary');
        service.loadDictionaryFromAssets('Mon dictionnaire');
        expect(service['loadDictionnary']).to.have.been.called;
    });

    it('should call loadDictionary on not valid dictionaryTitle', () => {
        chai.spy.on(service, 'loadDictionnary');
        service.loadDictionaryFromAssets(' ');
        expect(service['loadDictionnary']).to.have.been.called;
    });
});
