/*eslint-disable */

import { Room } from '@app/classes/room/room';
import { expect } from 'chai';
import { Container } from 'typedi';
import { DatabaseService } from '../database-services/database-service/database.service';
import { DatabaseServiceMock } from '../database-services/database-service/database.service.mock';
import { RoomManager } from './room-manager.service';

describe('RoomManager', () => {
    const databaseService: DatabaseServiceMock = new DatabaseServiceMock();
    let service: RoomManager;

    beforeEach(() => {
        service = Container.get(RoomManager);
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(RoomManager);
    });

    it('should add room', () => {
        expect(service.addRoom(0, databaseService as unknown as DatabaseService)).to.be.instanceOf(Room);
    });

    it('should find room if the id exist', () => {
        service.addRoom(0, databaseService as unknown as DatabaseService);
        expect(service.findRoom(0)).to.be.instanceOf(Room);
    });

    it('should not find a romm if the id does not exist', () => {
        expect(service.findRoom(-2)).to.be.undefined;
    });
});
