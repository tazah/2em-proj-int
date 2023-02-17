import { Service } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { CommandStatus } from './../../../../common/constants/constants';

@Service()
export class PassService {
    commandOutput: string;
    chatAuthor: ChatAuthor;
    private passCommandFormat: RegExp;

    constructor() {
        this.commandOutput = '';
        this.passCommandFormat = new RegExp('!passer|!Passer');
        this.chatAuthor = ChatAuthor.Player;
    }

    executeCommand(passParameters: string[]): CommandStatus {
        const isPassParametersValid: CommandStatus = this.isPassParametersValid(passParameters);
        this.commandOutput = isPassParametersValid === CommandStatus.SUCCESS_PASS_COMMAND ? passParameters.join(' ') : 'Commande invalide';
        return isPassParametersValid;
    }

    isPassParametersValid(passParameters: string[]): CommandStatus {
        const isPassCommandValid: boolean = passParameters.length === 1 && this.passCommandFormat.test(passParameters[0]);
        return isPassCommandValid ? CommandStatus.SUCCESS_PASS_COMMAND : CommandStatus.ERROR_PASS_COMMAND_INVALID;
    }
}
