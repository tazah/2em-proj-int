/*eslint-disable */
import { Objective, ObjectiveType } from '@common/objective/objective';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { CommandStatus } from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { PotentialWord } from './../../../../common/potential-word/potential-word';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { DebugService } from './debug.service';

describe('DebugService', () => {
    let service: DebugService;
    let gameModeService: GameModeService;
    let player: Player;
    let playerObjective: Objective;
    chai.use(spies);

    beforeEach(async () => {
        playerObjective = {
            index: 0,
            description: '',
            name: '',
            type: ObjectiveType.Private,
            isReached: false,
            score: 0,
            isPicked: false,
        };
        player = {
            tray: [],
            name: 'Karim',
            score: 0,
            socketId: '5',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: playerObjective,
        };

        service = Container.get(DebugService);
        gameModeService = Container.get(GameModeService);
    });
    it('should execute command', () => {
        chai.spy.on(service, 'isDebugParametersValid');
        const commandStatut: CommandStatus = service.executeCommand(['!deeebug'], player);
        expect(commandStatut).to.equal(CommandStatus.ERROR_DEBUG_COMMAND_PARAMETERS_INVALID);
    });

    // it('should return commande invalide', () => {
    //     service.chatAuthor = ChatAuthor.System;
    //     const commandStatus = service.executeDebugCommand(['!deebug'], player);
    //     expect(service.commandOutput).to.equal('Commande Invalide');
    //     expect(commandStatus).to.equal(CommandStatus.ERROR_DEBUG_COMMAND_PARAMETERS_INVALID);
    // });

    // it('should verify debug parametre to activate the debug command', () => {
    //     service.chatAuthor = ChatAuthor.System;
    //     const chat: Chat = { message: 'salut', author: service.chatAuthor };
    //     player = {
    //         name: 'salut',
    //         tray: ['a', 'b'],
    //         score: 0,
    //         debugOn: false,
    //         roomId: 1,
    //         socketId: '1',
    //         gameType: 1,
    //         chatHistory: [chat],
    //         privateOvjective: playerObjective,
    //     };
    //     service.executeDebugCommand(['!debug'], player);
    //     expect(service.isDebugParametersValid).to.be.called;
    // });

    // it('should verify debug parametre to desactivate the debug command', () => {
    //     service.chatAuthor = ChatAuthor.System;
    //     const chat: Chat = { message: 'salut', author: service.chatAuthor };
    //     player = {
    //         name: 'salut',
    //         tray: ['a', 'b'],
    //         score: 0,
    //         debugOn: true,
    //         roomId: 1,
    //         socketId: '1',
    //         gameType: 1,
    //         chatHistory: [chat],
    //         privateOvjective: playerObjective,
    //     };
    //     service.executeDebugCommand(['!debug'], player);
    //     expect(service.isDebugParametersValid).to.be.called;
    // });

    it('should return true if debugParameters are correct', () => {
        const commandStatus: CommandStatus = service.isDebugParametersValid(['!debug']);
        expect(commandStatus).to.equal(CommandStatus.SUCESS_DEBUG_COMMAND_PARAMETERS_VALID);
    });

    it('should continue createDebugMessage in horizontal direction if debug is on and return a debugMessage', () => {
        gameModeService.board[5][6].letter = 'a';
        const potentialWords: PotentialWord[] = [];
        potentialWords.push({ word: 'hello', score: 0, startPosition: { row: 5, column: 5 } });
        potentialWords.push({ word: 'hi', score: 0, startPosition: { row: 6, column: 6 } });
        expect(service.createDebugMessage('h', potentialWords)).not.to.be.equal('');
    });

    it('should continue createDebugMessage in vertical direction if debug is on and return a debugMessage', () => {
        gameModeService.board[6][5].letter = 'a';
        const potentialWords: PotentialWord[] = [];
        potentialWords.push({ word: 'hello', score: 0, startPosition: { row: 5, column: 5 } });
        potentialWords.push({ word: 'hi', score: 0, startPosition: { row: 6, column: 6 } });
        expect(service.createDebugMessage('v', potentialWords)).not.to.be.equal('');
    });

    it('should create nothing case debug is not activated', () => {
        gameModeService.match.players[0].debugOn = false;
        const potentialWords: PotentialWord[] = [];
        expect(service.createDebugMessage('v', potentialWords)).to.be.equal('');
    });
});
