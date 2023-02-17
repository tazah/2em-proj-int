/*eslint-disable */
import { BestScoreCollectionService } from '@app/services/database-services/best-score-collection-service/best-score-collection.service';
import { DatabaseService } from '@app/services/database-services/database-service/database.service';
import { BestScore, BestScoreMode } from '@common/best-score/best-score';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import Container from 'typedi';
import { DatabaseServiceMock } from '../database-service/database.service.mock';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import Sinon = require('sinon');
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('BestScoreCollection Service', () => {
    let client: MongoClient;
    let bestScoreCollectionService: BestScoreCollectionService;
    let databaseService: DatabaseServiceMock;
    const testBestScore: BestScore = {
        playerName: 'PlayerTest',
        score: 1000,
    };
    chai.use(spies);
    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        client.db('database').createCollection('ClassicBestScore');
        client.db('database').createCollection('LogBestScore');
        Container.set(DatabaseService, databaseService);
        bestScoreCollectionService = Container.get<BestScoreCollectionService>(BestScoreCollectionService);

        await bestScoreCollectionService.collection(BestScoreMode.Classic).insertOne(testBestScore);
        await bestScoreCollectionService.collection(BestScoreMode.Log).insertOne(testBestScore);
    });

    afterEach(async () => {
        chai.spy.restore();
        await bestScoreCollectionService.deleteAllBestScores(BestScoreMode.Classic);
        await bestScoreCollectionService.deleteAllBestScores(BestScoreMode.Log);
    });

    it('getAllBestScores should get all best Scores from DB for mode Classic', async () => {
        const bestScores = await bestScoreCollectionService.getAllBestScores(BestScoreMode.Classic);

        expect(bestScores[0]).to.deep.equals(testBestScore);
    });

    it('getAllBestScores should get all best Scores from DB for mode Log', async () => {
        const bestScores = await bestScoreCollectionService.getAllBestScores(BestScoreMode.Log);

        expect(bestScores[0]).to.deep.equals(testBestScore);
    });

    it('getFirstFiveBestScores should call get all best Scores function in getFiveBestScores function ', async () => {
        chai.spy.on(bestScoreCollectionService, 'getAllBestScores');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        bestScoreCollectionService.getFirstFiveBestScores(BestScoreMode.Classic);
        expect(bestScoreCollectionService.getAllBestScores).to.have.been.called;
    });

    it('getFirstFiveBestScores should return a table of FiveBestScores in getFiveBestScores function ', async () => {
        // const all= bestScoreCollectionService.getAllBestScores(BestScoreMode.Classic);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        await bestScoreCollectionService.resetAllBestScores();
        await bestScoreCollectionService.addNewBestScore({ playerName: 'test', score: 100 }, BestScoreMode.Classic);
        const fiveBestScores = await bestScoreCollectionService.getFirstFiveBestScores(BestScoreMode.Classic);
        expect(fiveBestScores[0].playerNames[0]).to.deep.equals('player1');
    });

    it('addBestScore should insert a new bestScore in classic mode', async () => {
        const bestScores = await bestScoreCollectionService.collection(BestScoreMode.Classic).find({}).toArray();
        expect(bestScores.find((x) => x.playerName === testBestScore.playerName)).to.deep.equals(testBestScore);
    });

    it('updateBestScore should  call addNewBestScore while insert a new bestScore in classic mode if new best score dont exists', async () => {
        chai.spy.on(bestScoreCollectionService, 'addNewBestScore');
        const testBestScore1 = { playerName: 'PlayerTest1', score: 99 };
        await bestScoreCollectionService.updateBestScore(testBestScore1, BestScoreMode.Classic);
        expect(bestScoreCollectionService.addNewBestScore).to.have.been.called;
    });

    it('addBestScore should insert a new bestScore in log2990 mode if bestScore if new best score dos not already exists in database', async () => {
        const bestScores = await bestScoreCollectionService.collection(BestScoreMode.Log).find({}).toArray();
        expect(bestScores.find((x) => x.playerName === testBestScore.playerName)).to.deep.equals(testBestScore);
    });
    it('updateBestScore should not insert a new bestScore in classic mode if bestScore of type BestScore does exists in database ', async () => {
        await bestScoreCollectionService.updateBestScore({ playerName: 'PlayerTest', score: 1000 }, BestScoreMode.Classic);
        const bestScores = await bestScoreCollectionService.collection(BestScoreMode.Classic).find({}).toArray();
        expect(bestScores.length).to.deep.equals(1);
    });

    it('deleteAllBestScores should delete all existing bestScores collections data ', async () => {
        await bestScoreCollectionService.deleteAllBestScores(BestScoreMode.Classic);
        const bestScoresFind = await bestScoreCollectionService.getAllBestScores(BestScoreMode.Classic);
        expect(bestScoresFind.length).to.equal(0);
    });

    it('resetAllBestScores should call deleteAllBestScores and insertResetBestScores while calling reset bestScores collections data function', async () => {
        chai.spy.on(bestScoreCollectionService, 'deleteAllBestScores');
        chai.spy.on(bestScoreCollectionService, 'insertResetBestScores');
        await bestScoreCollectionService.resetAllBestScores();
        expect(bestScoreCollectionService.deleteAllBestScores).to.have.been.called.twice;
        expect(bestScoreCollectionService.insertResetBestScores).to.have.been.called.twice;
    });
});
