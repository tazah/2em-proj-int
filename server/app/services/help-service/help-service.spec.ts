/* eslint-disable */
import { Objective, ObjectiveType } from '@common/objective/objective';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { Chat } from './../../../../common/chat/chat';
import { CommandStatus } from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { HelpService } from './help.service';

describe('HelpService', () => {
    let helpService: HelpService;
    let player: Player;
    const playerObjective: Objective = {
        index: 0,
        description: '',
        name: '',
        type: ObjectiveType.Private,
        isReached: false,
        score: 0,
        isPicked: false,
    };
    chai.use(spies);

    beforeEach(async () => {
        helpService = Container.get(HelpService);
        const chat: Chat = { message: 'salut', author: helpService.chatAuthor };
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

    it('should execute help command', () => {
        chai.spy.on(helpService, 'isHelpParametersValid');
        const status: CommandStatus = helpService.executeCommand(['!aide']);
        expect(status).to.equal(CommandStatus.SUCCESS_HELP_COMMAND);
    });

    it('executeCommand should execute help command', () => {
        const status: CommandStatus = helpService.executeCommand(['!aide']);
        expect(status).to.equal(26);
    });

    it('should return invalid if parameters not valid', () => {
        player.debugOn = true;
        helpService.executeCommand(['!aiede']);
        expect(helpService.commandOutput).to.equal('Commande Invalide');
    });
});
