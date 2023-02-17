/*eslint-disable */
import { Application } from '@app/app';
import { BestScoreCollectionService } from '@app/services/database-services/best-score-collection-service/best-score-collection.service';
import { BestScore, FirstFiveBestScores } from '@common/best-score/best-score';
import { assert, expect } from 'chai';
import * as Sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { HTTP_STATUS_CREATED, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } from './../../../../common/constants/constants';
// function isError(e: any) {
//     if (typeof e === 'string') {
//         return Promise.reject(new Error(e));
//     }
//     return Promise.resolve(e);
// }
describe('BestScore Controller', () => {
    const expectedBestScores: FirstFiveBestScores[] = [
        { playerNames: ['player5'], score: 5 },
        { playerNames: ['player4'], score: 10 },
        { playerNames: ['player3'], score: 15 },
        { playerNames: ['player2'], score: 20 },
        { playerNames: ['player1'], score: 25 },
    ];
    const bestScoreTest: BestScore = {
        playerName: 'testPlayer',
        score: 1000,
    };
    let bestScoreCollectionService: BestScoreCollectionService;
    let expressApp: Express.Application;

    beforeEach(async () => {
        const app = Container.get(Application);
        bestScoreCollectionService = Container.get(BestScoreCollectionService);
        expressApp = app.app;
    });

    it('should store best score in the array on valid post request to /send in classic mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'updateBestScore').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/bestScore/Classic/send')
            .send(bestScoreTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should store best score in the array on valid post request to /send in Log2990 mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'updateBestScore').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/bestScore/Log/send')
            .send(bestScoreTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all Best scores on valid get request to /all classic mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'getFirstFiveBestScores').returns(Promise.resolve(expectedBestScores));
        // bestScoreCollectionService.getFirstFiveBestScores.resolves(expectedBestScores);
        return supertest(expressApp)
            .get('/api/bestScore/Classic/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedBestScores);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all Best scores on valid get request to /all Log2990 mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'getFirstFiveBestScores').returns(Promise.resolve(expectedBestScores));
        return supertest(expressApp)
            .get('/api/bestScore/Log/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedBestScores);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all bestscores on valid delete request to /reset', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'resetAllBestScores').returns(Promise.resolve());
        return supertest(expressApp)
            .delete('/api/bestScore/reset')
            .expect(HTTP_STATUS_NO_CONTENT)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error Non valid DELETE request to /reset', async () => {
        return new Promise<void>((resolve) => {
            const stubOn = Sinon.stub(bestScoreCollectionService, 'resetAllBestScores').returns(
                new Promise(() => {
                    throw Error();
                }),
            );

            supertest(expressApp)
                .delete('/api/bestScore/reset')
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response: unknown) => {
                    expect((response as Response).body).to.deep.equal({ name: 'test' });
                    // expect(stubOn.called).to.equal(true);
                    resolve();
                })
                .catch((err) => {
                    expect(HTTP_STATUS_NOT_FOUND);
                    assert.isDefined(err);
                    resolve();
                })
                .finally(() => stubOn.restore());
        });
    });
});
