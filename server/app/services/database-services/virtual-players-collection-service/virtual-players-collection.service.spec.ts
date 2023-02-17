/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-imports */
import { DatabaseService } from '@app/services/database-services/database-service/database.service';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common/virtual-player-name/virtual-player-name';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import Container from 'typedi';
import { DatabaseServiceMock } from '../database-service/database.service.mock';
import { VirtualPlayersCollection } from './virtual-players-collection.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('VirtualPlayerCollection Service', () => {
    let client: MongoClient;
    let virtualPlayersCollectionService: VirtualPlayersCollection;
    let databaseService: DatabaseServiceMock;
    const testVirtualPlayer: VirtualPlayerName = {
        name: 'testBot',
    };
    chai.use(spies);
    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        client.db('database').createCollection('beginnerVirtualPlayers');
        client.db('database').createCollection('expertVirtualPlayers');
        Container.set(DatabaseService, databaseService);
        virtualPlayersCollectionService = Container.get<VirtualPlayersCollection>(VirtualPlayersCollection);

        await virtualPlayersCollectionService.collection(VirtualPlayerLevel.Beginner).insertOne(testVirtualPlayer);
        await virtualPlayersCollectionService.collection(VirtualPlayerLevel.Expert).insertOne(testVirtualPlayer);
    });

    afterEach(async () => {
        await virtualPlayersCollectionService.deleteAllVirtualPlayers(VirtualPlayerLevel.Beginner);
        await virtualPlayersCollectionService.deleteAllVirtualPlayers(VirtualPlayerLevel.Expert);
    });

    it('getAllVirtualPlayersNames should get all virtual players beginners names', async () => {
        const virtualPlayers = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(virtualPlayers[0]).to.deep.equals(testVirtualPlayer);
    });

    it('addName should insert a new beginner virtual player if virtual player name valid ', async () => {
        chai.spy.on(virtualPlayersCollectionService, 'validateVirtualPlayerName');
        const testVirtualPlayer1 = { name: 'test1bot' };
        await virtualPlayersCollectionService.addName(testVirtualPlayer1, VirtualPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        expect(virtualPlayersCollectionService.validateVirtualPlayerName).to.have.been.called;
        expect(virtualPlayerNames.length).to.deep.equals(2);
    });

    it('addName should not insert a new beginner virtual player if virtual player name not valid', async () => {
        const testVirtualPlayer1 = { name: '  ' };
        await virtualPlayersCollectionService.addName(testVirtualPlayer1, VirtualPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        expect(virtualPlayerNames.length).to.deep.equals(1);
    });

    it('modifyName should modify a beginner virtual player ', async () => {
        const testVirtualPlayer1 = { name: 'test1bot' };
        await virtualPlayersCollectionService.modifyName(testVirtualPlayer.name, testVirtualPlayer1, VirtualPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        expect(virtualPlayerNames[0].name).to.deep.equals(testVirtualPlayer1.name);
    });

    it('getAllVirtualPlayersNames should delete a beginner virtual player if does not exists in default virtual players ', async () => {
        await virtualPlayersCollectionService.deleteName(testVirtualPlayer.name, VirtualPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        expect(virtualPlayerNames.length).not.to.be.undefined;
    });
    it('deleteName should not delete a default beginner virtual player if exists in default virtual players ', async () => {
        await virtualPlayersCollectionService.resetAllVirtualPlayers();
        await virtualPlayersCollectionService.deleteName('bot1', VirtualPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        expect(virtualPlayerNames.length).to.deep.equals(3);
    });

    it('resetAllVirtualPlayersNames should reset virtualPlayercollections data ', async () => {
        chai.spy.on(virtualPlayersCollectionService, 'deleteAllVirtualPlayers');
        chai.spy.on(virtualPlayersCollectionService, 'insertResetVirtualPlayers');
        await virtualPlayersCollectionService.resetAllVirtualPlayers();
        const virtualPlayersFind = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner);
        expect(virtualPlayersFind.length).to.not.equal(0);
        expect(virtualPlayersCollectionService.deleteAllVirtualPlayers).to.have.been.called;
        expect(virtualPlayersCollectionService.insertResetVirtualPlayers).to.have.been.called;
    });
});
