import { BankService } from '@app/services/bank-service/bank.service';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { CommandStatus, RESERVE_NUMBER } from './../../../../common/constants/constants';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { ExchangeService } from './exchange.service';

describe('ExchangeService', () => {
    let service: ExchangeService;
    let gameService: GameModeService;
    let bankService: BankService;
    chai.use(spies);

    beforeEach(async () => {
        service = Container.get(ExchangeService);
        gameService = Container.get(GameModeService);
        bankService = Container.get(BankService);
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(ExchangeService);
    });

    it('isExchangeParametersValid() with valid parameters', () => {
        const exchangeParams: string[] = ['!échanger', 'abcde'];
        gameService.match.players[gameService.match.activePlayer].tray = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        expect(service.isExchangeParametersValid(exchangeParams)).to.be.equal(CommandStatus.SUCCESS_EXCHANGE_COMMAND_PARAMETERS_VALID);
    });

    it('isExchangeParametersValid() with invalid parameters', () => {
        const exchangeParams: string[] = ['!échanger', ' '];
        gameService.match.players[gameService.match.activePlayer].tray = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        expect(service.executeCommand(exchangeParams)).to.be.equal(CommandStatus.ERROR_EXCHANGE_COMMAND_PARAMETERS_INVALID);
    });

    it('should return insuficiant letter in bank case theres not enough letters', () => {
        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        gameService.initializeGame(parameters);
        gameService.bank.initializeBank();
        chai.spy.on(bankService, 'getReserveNumber', () => RESERVE_NUMBER);
        service.chatAuthor = ChatAuthor.System;
        gameService.match.players[gameService.match.activePlayer].tray = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const exchangeParams: string[] = ['!échanger', 'abcdefg'];
        expect(service.executeCommand(exchangeParams)).to.be.equal(CommandStatus.ERROR_EXCHANGE_COMMAND_INSUFFICENT_LETTERS_IN_BANK);
    });

    it('should return command impossible case the command is valid but you dont have letters on tray', () => {
        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        gameService.initializeGame(parameters);
        gameService.bank.initializeBank();
        service.chatAuthor = ChatAuthor.System;
        gameService.match.players[gameService.match.activePlayer].tray = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const exchangeParams: string[] = ['!échanger', 'abcx'];
        service.executeCommand(exchangeParams);
        expect(service.commandOutput).to.be.equal('Commande Invalide: pas assez de lettres dans la réserve.');
    });
});
