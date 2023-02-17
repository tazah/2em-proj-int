/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { DatabaseService } from '@app/services/database-services/database-service/database.service';
import { DatabaseServiceMock } from '@app/services/database-services/database-service/database.service.mock';
import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import Container from 'typedi';
import { INDEX_NOT_FOUND } from './../../../../common/constants/constants';
import { Room } from './room';

describe('Room', () => {
    let client: MongoClient;
    const databaseService: DatabaseServiceMock = new DatabaseServiceMock();
    const room: Room = new Room(INDEX_NOT_FOUND, 0, databaseService as unknown as DatabaseService);
    beforeEach(async () => {
        client = (await databaseService.start()) as MongoClient;
        client.db('database').createCollection('Dictionary');
        Container.set(DatabaseService, databaseService);
    });
    it('should create a gameManager ', () => {
        expect(room).to.exist;
        expect(room).to.be.instanceOf(Room);
    });
});
