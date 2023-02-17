import { CommandStatus, TRAY_SIZE } from '@app/../../common/constants/constants';
import { Command } from '@app/classes/command/command';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { Service } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';

@Service()
export class ExchangeService implements Command {
    commandOutput: string;
    chatAuthor: ChatAuthor;

    constructor(private gameModeService: GameModeService) {
        this.chatAuthor = ChatAuthor.System;
        this.commandOutput = '';
    }

    isExchangeParametersValid(message: string[]): CommandStatus {
        const exchangeParamsFormat = new RegExp('^[a-z*]{1,7}$');
        return exchangeParamsFormat.test(message[message.length - 1]) && message.length === 2
            ? CommandStatus.SUCCESS_EXCHANGE_COMMAND_PARAMETERS_VALID
            : CommandStatus.ERROR_EXCHANGE_COMMAND_PARAMETERS_INVALID;
    }

    executeCommand(exchangeParameters: string[]): CommandStatus {
        this.chatAuthor = ChatAuthor.System;
        const playerTray: string[] = this.gameModeService.match.players[this.gameModeService.match.activePlayer].tray;
        const lettersToExchange = exchangeParameters[1];

        if (this.isExchangeParametersValid(exchangeParameters) !== CommandStatus.SUCCESS_EXCHANGE_COMMAND_PARAMETERS_VALID) {
            this.commandOutput = 'Commande Impossible';
            return CommandStatus.ERROR_EXCHANGE_COMMAND_PARAMETERS_INVALID;
        }
        if (this.gameModeService.bank.getReserveNumber() < TRAY_SIZE) {
            this.commandOutput = 'Commande Invalide: pas assez de lettres dans la réserve.';
            return CommandStatus.ERROR_EXCHANGE_COMMAND_INSUFFICENT_LETTERS_IN_BANK;
        }

        for (const letter of lettersToExchange) {
            if (!playerTray.includes(letter)) {
                this.commandOutput = 'Commande Impossible';
                return CommandStatus.ERROR_EXCHANGE_COMMAND_IMPOSSIBLE;
            }
        }
        for (const letter of lettersToExchange) {
            playerTray.splice(playerTray.indexOf(letter), 1);
            this.gameModeService.bank.fill(letter);
        }
        const newLetters: string[] = this.gameModeService.bank.draw(lettersToExchange.length);
        this.gameModeService.match.players[this.gameModeService.match.activePlayer].tray = playerTray.concat(newLetters);
        this.commandOutput = this.gameModeService.match.players[this.gameModeService.match.activePlayer].name + ' : ' + exchangeParameters.join(' ');
        this.chatAuthor = ChatAuthor.Player;
        return CommandStatus.SUCCESS_EXCHANGE_COMMAND;
    }
}
