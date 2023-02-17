/*eslint-disable */
import { Objective, ObjectiveType } from '@common/objective/objective';
import { expect } from 'chai';
import { Container } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { CommandStatus } from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { CommandService } from './../command-service/command.service';
import { GameModeService } from './../game-mode-service/game-mode.service';

describe('CommandService', () => {
    let service: CommandService;
    let gameService: GameModeService;
    let player: Player;
    let playerObjective: Objective;

    beforeEach(async () => {
        service = Container.get(CommandService);
        gameService = Container.get(GameModeService);
        gameService.match.players[0].name = 'Karim';
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
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: playerObjective,
        };
        gameService.match.activePlayer = 0;
    });

    it('should be created', () => {
        expect(service).to.exist;
    });
    it('isMessageCommand() function test with a normal message', () => {
        expect(service.isMessageCommand('hello')).to.be.false;
    });
    it('isMessageCommand() function test with a command message', () => {
        expect(service.isMessageCommand('!passer')).to.be.true;
    });
    it('isKeywordValid() function test with a valid Keyword', () => {
        expect(service.isKeywordValid('!passer')).to.be.true;
    });
    it('isKeywordValid() function test with a valid Keyword', () => {
        expect(service.isKeywordValid('!échanger abcds')).to.be.true;
    });
    it('isKeywordValid() function test with a not valid Keyword', () => {
        expect(service.isKeywordValid('!hello')).to.be.false;
    });
    it('isKeywordValid() function test with a spelling mistake in the keyword', () => {
        expect(service.isKeywordValid('!paser')).to.be.false;
    });
    it('isDebugCommand() function test with a debug command', () => {
        expect(service.isDebugCommand('!debug')).to.be.true;
    });
    it('isDebugCommand() function test with a not valid command', () => {
        expect(service.isDebugCommand('!defug')).to.be.false;
    });
    it('getCommandParameters() with passer command', () => {
        expect(service.getCommandParameters('!passer')).to.be.deep.equal(['!passer']);
    });
    it('getCommandParameters() with placer command', () => {
        expect(service.getCommandParameters('!placer h8h abcde')).to.be.deep.equal(['!placer', 'h8h', 'abcde']);
    });
    it('getCommandParameters() with echanger command', () => {
        expect(service.getCommandParameters('!échanger abcde')).to.be.deep.equal(['!échanger', 'abcde']);
    });
    it('handleCommand() with invalid keyword with a spelling mistake', () => {
        expect(service.handleCommand('!échanker', player)).to.be.deep.equal({ message: 'Erreur de syntaxe', author: ChatAuthor.System });
    });

    it('handleCommand() with a normal message', () => {
        expect(service.handleCommand('hello', player)).to.be.deep.equal({ message: 'hello', author: ChatAuthor.Player });
    });
    it('handleCommand() with a valid command passer', () => {
        expect(service.handleCommand('!passer', player)).to.be.deep.equal({ message: '!passer', author: ChatAuthor.Player });
    });
    it('handleCommand() with an impossible exchange command', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['a', 'b', 'c'];
        expect(service.handleCommand('!échanger zxy', player)).to.be.deep.equal({ message: 'Commande Impossible', author: ChatAuthor.System });
    });

    it('handleCommand() with a possible command échanger', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['a', 'b', 'c'];
        expect(service.handleCommand('!échanger abc', player)).to.be.deep.equal({ message: 'Karim : !échanger abc', author: ChatAuthor.Player });
    });

    it('handleCommand() with a possible command passer', () => {
        expect(service.handleCommand('!passer', player)).to.be.deep.equal({ message: '!passer', author: ChatAuthor.Player });
    });

    it('handleCommand() tAHA', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['o', 'p', 'i'];
        expect(service.handleCommand('!pacer', player)).to.be.deep.equal({ message: 'Erreur de syntaxe', author: ChatAuthor.System });
    });

    it('handleCommand() !debug', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['o', 'p', 'i'];
        player.debugOn = true;
        expect(service.handleCommand('!debug', player)).to.be.deep.equal({ message: 'affichages de débogage désactivés', author: ChatAuthor.System });
    });

    it('handleCommand() !debug', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['o', 'p', 'i'];
        player.debugOn = false;
        expect(service.handleCommand('!debug', player)).to.be.deep.equal({ message: 'affichages de débogage activés', author: ChatAuthor.System });
    });

    it('handleCommand() !reserve', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['o', 'p', 'i'];
        expect(service.handleCommand('!rserve', player)).to.be.deep.equal({ message: 'Erreur de syntaxe', author: ChatAuthor.System });
    });

    it('handleCommand() !reserve', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['o', 'p', 'i'];
        player.debugOn = true;
        expect(service.handleCommand('!réserve', player)).to.be.not.equal({ message: 'Commande Impossible', author: ChatAuthor.System });
        expect(service.handleCommand('!réserve', player)).to.be.not.equal({ message: 'Erreur Syntaxe', author: ChatAuthor.System });
    });

    it('handleCommand() !aide', () => {
        gameService.match.players[gameService.match.activePlayer].tray = ['o', 'p', 'i'];
        player.debugOn = true;
        expect(service.handleCommand('!aide', player)).to.be.not.equal({ message: 'Commande Impossible', author: ChatAuthor.System });
        expect(service.handleCommand('!aide', player)).to.be.not.equal({ message: 'Erreur Syntaxe', author: ChatAuthor.System });
    });

    it('isDebugCommand should return true if the first parameter is !debug', () => {
        expect(service.isDebugCommand('!debug')).to.be.true;
    });

    it('isDebugCommand should return false if the first parameter is not !debug', () => {
        expect(service.isDebugCommand('!defug')).to.be.false;
    });

    it('handleCommand(message) should return Command Invalide if message is not keyword valid', () => {
        expect(service.handleCommand('!hello', player)).to.be.deep.equal({ message: 'Erreur de syntaxe', author: ChatAuthor.System });
    });

    it('handleCommand(message) should not set the timer a 1 if command is different from !debug', () => {
        expect(service.handleCommand('!passer', player)).to.be.deep.equal({ message: '!passer', author: ChatAuthor.Player });
    });

    it('should test commands case valid', () => {
        const message = '!passer';
        expect(service.checkCommand(message)).to.equal(CommandStatus.SUCESS_COMMAND_VALID_KEYWORD);
    });

    it('should test commands case invalid', () => {
        const message = '!passser';
        expect(service.checkCommand(message)).to.equal(CommandStatus.ERROR_SYNTAX);
    });

    it('should test commands case normal message', () => {
        const message = 'salut';
        expect(service.checkCommand(message)).to.equal(CommandStatus.SUCESS_MESSAGE);
    });

    it('should check if is singular command', () => {
        const message = 'salut';
        expect(service.isSingularCommand(message)).to.equal(service['isSingularCommandFormat'].test(message));
    });

    it('set timer at 1 case regex validation is impossible', () => {
        service.handleCommand('Impossible', player);
        expect(gameService.match.parameters.timer).to.be.deep.equal(1);
    });
});
