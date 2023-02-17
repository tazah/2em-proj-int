/*eslint-disable */
import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import Container from 'typedi';
import { DatabaseService } from '../database-services/database-service/database.service';
import { DatabaseServiceMock } from '../database-services/database-service/database.service.mock';
import { GameManager } from './game-manager.service';

describe('GameManager', () => {
    let client: MongoClient;
    const databaseService: DatabaseServiceMock = new DatabaseServiceMock();
    const game: GameManager = new GameManager(databaseService as unknown as DatabaseService);
    beforeEach(async () => {
        client = (await databaseService.start()) as MongoClient;
        client.db('database').createCollection('Dictionary');
        Container.set(DatabaseService, databaseService);
    });
    it('should create a gameManager ', () => {
        expect(game).to.exist;
        expect(game).to.be.an.instanceOf(GameManager);
        expect(game.chatBoxService).to.exist;
    });
});
