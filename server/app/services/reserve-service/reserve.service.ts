import { Service } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { ALPHABET, CommandStatus } from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { GameModeService } from './../game-mode-service/game-mode.service';

@Service()
export class ReserveService {
    commandOutput: string;
    chatAuthor: ChatAuthor;
    private reserveCommandFormat: RegExp;

    constructor(private gameModeService: GameModeService) {
        this.reserveCommandFormat = new RegExp('!réserve|!Réserve');
        this.commandOutput = '';
        this.chatAuthor = ChatAuthor.System;
    }

    executeCommand(reserveParameters: string[], player: Player): CommandStatus {
        const isReserveParametersValid: CommandStatus = this.isReserveParametersValid(reserveParameters);
        const isDebugOnAndParametersValid = player.debugOn && isReserveParametersValid === CommandStatus.SUCCESS_RESERVE_COMMAND_PARAMETERS_VALID;
        const isDebugOnAndParametersInvalid = player.debugOn && isReserveParametersValid !== CommandStatus.SUCCESS_RESERVE_COMMAND_PARAMETERS_VALID;

        if (isDebugOnAndParametersValid) {
            this.commandOutput = this.createReserveMessage();
            return CommandStatus.SUCCESS_RESERVE_COMMAND;
        }

        if (isDebugOnAndParametersInvalid) {
            this.commandOutput = 'Commande Invalide';
            return CommandStatus.ERROR_RESERVE_COMMAND_PARAMETERS_INVALID;
        }

        this.commandOutput = 'debug non activé';
        return CommandStatus.ERROR_RESERVE_COMMAND_PARAMETERS_INVALID;
    }

    isReserveParametersValid(reserveParameters: string[]): CommandStatus {
        const isParametersValid: boolean = reserveParameters.length === 1 && this.reserveCommandFormat.test(reserveParameters[0]);
        return isParametersValid ? CommandStatus.SUCCESS_RESERVE_COMMAND_PARAMETERS_VALID : CommandStatus.ERROR_RESERVE_COMMAND_PARAMETERS_INVALID;
    }

    createReserveMessage(): string {
        let reserveMessage = 'Réserve: ' + '\n';
        let letterMessage = '';
        for (const letter of ALPHABET) {
            letterMessage += letter.toUpperCase() + ': ';
            letterMessage += this.gameModeService.bank.getQuantity(letter) + '\n';
            reserveMessage = letterMessage;
        }
        return reserveMessage;
    }
}
