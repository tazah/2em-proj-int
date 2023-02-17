/*eslint-disable */
import { Application } from '@app/app';
import { DictionnaryCollectionService } from '@app/services/database-services/dictionary-collection-service/dictionary-collection.service';
import { HTTP_STATUS_CREATED, HTTP_STATUS_ERROR, HTTP_STATUS_OK } from '@common/constants/constants';
import { Dictionary } from '@common/dictionary/dictionary';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('DictionaryController', () => {
    const baseDictionaryInfo = {
        title: 'le petit dictionnaire',
        description: 'Le dictionnaire test',
    };

    let dictionaryCollectionService: DictionnaryCollectionService;
    let expressApp: Express.Application;

    beforeEach(async () => {
        const app = Container.get(Application);
        dictionaryCollectionService = Container.get(DictionnaryCollectionService);
        expressApp = app.app;
    });

    it('should store dictionary in the array on valid post request to /sendDictionary', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'addDictionary').returns('Success');
        return supertest(expressApp)
            .post('/api/dictionary/sendDictionary')
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all the dictionaries on valid get request to /all', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'getAllDictionaries').returns([baseDictionaryInfo]);
        return supertest(expressApp)
            .get('/api/dictionary/all')
            .then((response) => {
                expect(response.body).to.deep.equal([baseDictionaryInfo]);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not valid get request to /all', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'getAllDictionaries').throwsException(
            new Error('Une erreur est survenue lors de la lecture des fichiers dans Assets'),
        );
        return supertest(expressApp)
            .get('/api/dictionary/all')
            .expect(HTTP_STATUS_ERROR)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return the dictionary on valid put request to title/:title', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'modifyDictionary').returns();
        return supertest(expressApp)
            .put('/api/dictionary/modifyDictionary/:title')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not  valid put request to title/:title', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'modifyDictionary').throws();
        return supertest(expressApp)
            .put('/api/dictionary/modifyDictionary/:title')
            .expect(HTTP_STATUS_ERROR)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return the dictionary on valid get request to title/:title', async () => {
        const dictionary: Dictionary = { title: 'testTitre', description: ' dictionary test', words: [] };
        const stubOn = Sinon.stub(dictionaryCollectionService, 'getDictionary').returns(dictionary);
        return supertest(expressApp)
            .get('/api/dictionary/title/:title')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(dictionary);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not valid get request to title/:title', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'getDictionary').throws(new Error('Impossible de trouver le fichier cherché'));
        return supertest(expressApp)
            .get('/api/dictionary/title/:title')
            .expect(HTTP_STATUS_ERROR)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should delete the dictionary on valid delete request to title/:title', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'deleteDictionary');
        return supertest(expressApp)
            .delete('/api/dictionary/title/:title')
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error  on not  valid delete request to title/:title', async () => {
        // dictionaryCollectionService.getAllDictionaries.resolves([baseDictionary, baseDictionary]);
        const stubOn = Sinon.stub(dictionaryCollectionService, 'deleteDictionary').throws(new Error('Impossible de trouver le fichier cherché'));
        return supertest(expressApp)
            .delete('/api/dictionary/title/:title')
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_ERROR)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should delete the dictionary on valid delete request to /reset', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'resetDictionaries').returns();
        return supertest(expressApp)
            .delete('/api/dictionary/reset')
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should delete the dictionary on not valid delete request to /reset', async () => {
        const stubOn = Sinon.stub(dictionaryCollectionService, 'resetDictionaries').throws();
        return supertest(expressApp)
            .delete('/api/dictionary/reset')
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_ERROR)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });
});
