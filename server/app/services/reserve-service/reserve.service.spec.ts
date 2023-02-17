/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Objective, ObjectiveType } from '@common/objective/objective';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { Chat } from './../../../../common/chat/chat';
import { CommandStatus } from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { ReserveService } from './reserve.service';

describe('ReserveService', () => {
    let reserveService: ReserveService;
    let player: Player;
    chai.use(spies);
    const playerObjective: Objective = {
        index: 0,
        description: '',
        name: '',
        type: ObjectiveType.Private,
        isReached: false,
        score: 0,
        isPicked: false,
    };

    beforeEach(async () => {
        reserveService = Container.get(ReserveService);
        const chat: Chat = { message: 'salut', author: reserveService.chatAuthor };
        player = {
            name: 'salut',
            tray: ['a', 'b'],
            score: 0,
            debugOn: false,
            roomId: 1,
            socketId: '1',
            gameType: 1,
            chatHistory: [chat],
            privateOvjective: playerObjective,
        };
    });

    it('should execute reserve command', () => {
        chai.spy.on(reserveService, 'isReserveParametersValid');
        player.debugOn = true;
        const status: CommandStatus = reserveService.executeCommand(['!réserve'], player);
        expect(status).to.equal(CommandStatus.SUCCESS_RESERVE_COMMAND);
    });

    it('should execute command', () => {
        player.debugOn = true;
        const status: CommandStatus = reserveService.executeCommand(['!réserve'], player);
        expect(status).to.equal(23);
    });

    it('should return invalid if debug is not on', () => {
        player.debugOn = false;
        reserveService.executeCommand(['!réserve'], player);
        expect(reserveService.commandOutput).to.equal('debug non activé');
    });

    it('should return invalid if parameters not valid', () => {
        player.debugOn = true;
        reserveService.executeCommand(['!reserve'], player);
        expect(reserveService.commandOutput).to.equal('Commande Invalide');
    });
});
