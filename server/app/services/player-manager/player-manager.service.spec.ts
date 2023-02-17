import { Objective, ObjectiveType } from '@common/objective/objective';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Container } from 'typedi';
import { Player } from './../../../../common/player/player';
import { PlayerManager } from './../player-manager/player-manager.service';

describe('PlayerManager', () => {
    let service: PlayerManager;
    const playerObjective: Objective = {
        index: 0,
        description: '',
        name: '',
        type: ObjectiveType.Private,
        isReached: false,
        score: 0,
        isPicked: false,
    };
    const player: Player = {
        name: 'ali',
        tray: [],
        score: 0,
        socketId: '20',
        roomId: -1,
        gameType: 0,
        debugOn: false,
        chatHistory: [],
        privateOvjective: playerObjective,
    };

    beforeEach(async () => {
        service = Container.get(PlayerManager);
    });

    it('should add player', () => {
        const player1: Player = service.addPlayer('ali', '20');
        expect(player1.name).to.be.equal(player.name);
        expect(player1.socketId).to.be.equal(player.socketId);
    });

    it('should get player from socketID', () => {
        service.addPlayer(player.name, player.socketId);
        expect(service.getPlayerFromSocketID(player.socketId).name).to.be.equal(player.name);
    });

    it('should delete player', () => {
        const player1: Player = service.addPlayer('ali', '20');
        service.deletePlayer(player1.socketId);
        expect(service.players[service.players.length - 1]).to.equal(service.getPlayerFromSocketID(player1.socketId));
    });
});
