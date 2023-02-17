import { Player } from '@common/player/player';
import { Service } from 'typedi';
import { CommandStatus } from './../../../../common/constants/constants';

@Service()
export abstract class Command {
    commandOutput: string = '';
    abstract executeCommand(commandParameters?: string[], player?: Player): CommandStatus;
}
