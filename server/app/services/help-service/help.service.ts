import { Service } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { CommandStatus, HELP_MESSAGE } from './../../../../common/constants/constants';

@Service()
export class HelpService {
    commandOutput: string;
    chatAuthor: ChatAuthor;
    private helpCommandFormat: RegExp;
    constructor() {
        this.helpCommandFormat = new RegExp('!aide|!Aide');
        this.commandOutput = '';
        this.chatAuthor = ChatAuthor.System;
    }

    executeCommand(helpParameters: string[]): CommandStatus {
        const isHelpParametersValid: CommandStatus = this.isHelpParametersValid(helpParameters);
        if (isHelpParametersValid === CommandStatus.SUCCESS_HELP_COMMAND_PARAMETERS_VALID) {
            this.commandOutput = this.createHelpMessage();
            return CommandStatus.SUCCESS_HELP_COMMAND;
        } else {
            this.commandOutput = 'Commande Invalide';
            return CommandStatus.ERROR_HELP_COMMAND_PARAMETERS_INVALID;
        }
    }

    isHelpParametersValid(helpParameters: string[]): CommandStatus {
        const isParametersValid: boolean = helpParameters.length === 1 && this.helpCommandFormat.test(helpParameters[0]);
        return isParametersValid ? CommandStatus.SUCCESS_HELP_COMMAND_PARAMETERS_VALID : CommandStatus.ERROR_HELP_COMMAND_PARAMETERS_INVALID;
    }

    createHelpMessage(): string {
        return HELP_MESSAGE;
    }
}
