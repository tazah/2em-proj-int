/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Objective, ObjectiveType } from '@common/objective/objective';
import { Player } from '@common/player/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { MongoClient } from 'mongodb';
import { BEGINNER_VIRTUAL_PLAYERS, EXPERT_VIRTUAL_PLAYERS } from './../../../../common/constants/constants';
import { VirtualPlayerDifficulty } from './../../../../common/parameters/parameters';
import { DatabaseService } from './../database-services/database-service/database.service';
import { DatabaseServiceMock } from './../database-services/database-service/database.service.mock';
import { DictionnaryCollectionService } from './../database-services/dictionary-collection-service/dictionary-collection.service';
import { VirtualPlayersCollection } from './../database-services/virtual-players-collection-service/virtual-players-collection.service';
import { DictionnaryService } from './../dictionnary-service/dictionnary.service';
import { ObjectivesService } from './../objectives-service/objectives.service';
import { InitializationService } from './initialization.service';

describe('InitializationService', () => {
    let service: InitializationService;
    let client: MongoClient;
    const databaseService: DatabaseServiceMock = new DatabaseServiceMock();
    let virtualPlayersCollection: VirtualPlayersCollection;
    chai.use(spies);

    before(async () => {
        client = (await databaseService.start()) as MongoClient;
        client.db('database').createCollection('beginnerVirtualPlayers');
        client.db('database').createCollection('expertVirtualPlayers');
        virtualPlayersCollection = new VirtualPlayersCollection(databaseService as unknown as DatabaseService);
        service = new InitializationService(
            virtualPlayersCollection,
            new ObjectivesService(new DictionnaryService(new DictionnaryCollectionService())),
        );
        service.virtualPlayerBeginnerNames = BEGINNER_VIRTUAL_PLAYERS;
        service.virtualPlayerExpertNames = EXPERT_VIRTUAL_PLAYERS;
        service.virtualPlayerBeginnerNames.push({ name: 'Karim' });
        service.virtualPlayerExpertNames.push({ name: 'Ali' });
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('getVirtualPlayerName should get a random name from beginner virtualPlayerNames', () => {
        expect(BEGINNER_VIRTUAL_PLAYERS).to.deep.contain(service.getVirtualPlayerName(VirtualPlayerDifficulty.Beginner));
    });

    it('getVirtualPlayerName should get a random name from virtualPlayerNames', () => {
        expect(EXPERT_VIRTUAL_PLAYERS).to.deep.contain(service.getVirtualPlayerName(VirtualPlayerDifficulty.Expert));
    });

    it('setVirtualOpponentName should get set a name to the expert virtual player different from the players ', () => {
        expect(service.setVirtualOpponentName(EXPERT_VIRTUAL_PLAYERS[0].name, VirtualPlayerDifficulty.Expert)).not.to.equal(
            EXPERT_VIRTUAL_PLAYERS[0].name,
        );
    });

    it('setVirtualOpponentName should get set a name to the beginner virtual player different from the players if we force it to be the same', () => {
        let virtualPlayerName;
        for (let i = 0; i < 10; i++) {
            virtualPlayerName = service.setVirtualOpponentName(service.virtualPlayerBeginnerNames[0].name, VirtualPlayerDifficulty.Beginner);
        }
        expect(virtualPlayerName).not.to.equal(service.virtualPlayerBeginnerNames[0].name);
    });

    it('setVirtualOpponentName should set expert virtual player name different to the player name case they are the same', () => {
        chai.spy.on(service, 'getVirtualPlayerName', () => EXPERT_VIRTUAL_PLAYERS[0]);
        setTimeout(() => {
            chai.spy.restore();
        }, 15);
        const realPlayerName = EXPERT_VIRTUAL_PLAYERS[0].name;
        let virtualPlayerName;
        setTimeout(() => {
            virtualPlayerName = service.setVirtualOpponentName(realPlayerName, VirtualPlayerDifficulty.Expert);
        }, 10);
        service.applyRandomBonus();
        expect(virtualPlayerName).to.be.not.equal(EXPERT_VIRTUAL_PLAYERS[0]);
    });

    it('setVirtualOpponentName should set beginner virtual player name different to the player name case they are the same', () => {
        chai.spy.on(service, 'getVirtualPlayerName', () => BEGINNER_VIRTUAL_PLAYERS[0]);
        setTimeout(() => {
            chai.spy.restore();
        }, 15);
        const realPlayerName = BEGINNER_VIRTUAL_PLAYERS[0].name;
        let virtualPlayerName;
        setTimeout(() => {
            virtualPlayerName = service.setVirtualOpponentName(realPlayerName, VirtualPlayerDifficulty.Expert);
        }, 10);
        service.applyRandomBonus();
        expect(virtualPlayerName).to.be.not.equal(BEGINNER_VIRTUAL_PLAYERS[0]);
    });

    it('initializeBonusCounter should initialize bonus counter', () => {
        expect(service.initializeBonusCounter()).instanceOf(Map);
    });

    it('getVirtualPlayerNames should getVirtualPlayersNames', async () => {
        await service.getVirtualPlayerNames();
        const virtualPlayerBeginnerNames = BEGINNER_VIRTUAL_PLAYERS;
        virtualPlayerBeginnerNames.push({ name: 'Karim' });
        const virtualPlayerExpertNames = EXPERT_VIRTUAL_PLAYERS;
        virtualPlayerExpertNames.push({ name: 'Ali' });
        expect(service.virtualPlayerBeginnerNames).to.equal(virtualPlayerBeginnerNames);
        expect(service.virtualPlayerExpertNames).to.equal(virtualPlayerExpertNames);
    });

    it('initializeVirtualPlayer should initialize virtual player with leaving player informations', () => {
        const playerObjective: Objective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };
        const leavingPlayer: Player = {
            name: 'kali',
            tray: ['w'],
            score: 0,
            socketId: '20',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: playerObjective,
        };

        expect(service.initializeVirtualPlayer('kali', leavingPlayer, VirtualPlayerDifficulty.Beginner).tray).to.be.equal(leavingPlayer.tray);
        expect(service.initializeVirtualPlayer('kali', leavingPlayer, VirtualPlayerDifficulty.Beginner).score).to.be.equal(leavingPlayer.score);
        expect(service.initializeVirtualPlayer('kali', leavingPlayer, VirtualPlayerDifficulty.Beginner).roomId).to.be.equal(leavingPlayer.roomId);
        expect(service.initializeVirtualPlayer('kali', leavingPlayer, VirtualPlayerDifficulty.Beginner).chatHistory).to.be.equal(
            leavingPlayer.chatHistory,
        );
        expect(service.initializeVirtualPlayer('kali', leavingPlayer, VirtualPlayerDifficulty.Beginner).privateOvjective).to.be.equal(
            leavingPlayer.privateOvjective,
        );
    });

    it('initializeObjectives should initialize public objectives if isPublicObjectives is true', () => {
        expect(service.initializeObjectives(true)).to.not.equal([]);
    });

    it('initializeObjectives should initialize public objectives if isPublicObjectives is false', () => {
        expect(service.initializeObjectives(false)).to.not.equal([]);
    });
});
