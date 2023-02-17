import {
    CommandStatus,
    DEBUG_COMMAND,
    EXCHANGE_COMMAND,
    HELP_COMMAND,
    PASS_COMMAND,
    PLACE_COMMAND,
    RESERVE_COMMAND,
} from '@app/../../common/constants/constants';
import { Command } from '@app/classes/command/command';
import { DebugService } from '@app/services/debug-service/debug.service';
import { ExchangeService } from '@app/services/exchange-service/exchange.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { PassService } from '@app/services/pass-service/pass.service';
import { PlaceService } from '@app/services/place-service/place.service';
import { Service } from 'typedi';
import { Chat, ChatAuthor } from './../../../../common/chat/chat';
import { Player } from './../../../../common/player/player';
import { HelpService } from './../help-service/help.service';
import { ReserveService } from './../reserve-service/reserve.service';

@Service()
export class CommandService {
    commandOutput: string;
    private messageFormat: RegExp;
    private keywordFormat: RegExp;
    private debugCommandFormat: RegExp;
    private isSingularCommandFormat: RegExp;
    private isSingularCommandOutput: RegExp;
    private commands: Map<string, Command>;
    private chatAuthor: ChatAuthor;
    constructor(
        private gameModeService: GameModeService,
        public currentCommand: Command,
        private passService: PassService,
        private placeService: PlaceService,
        private exchangeService: ExchangeService,
        private debugService: DebugService,
        private reserveService: ReserveService,
        private helpService: HelpService,
    ) {
        this.commands = new Map();
        this.bindCommands();
        this.commandOutput = '';
        this.chatAuthor = ChatAuthor.System;
        this.messageFormat = new RegExp('^!');
        this.keywordFormat = new RegExp('^!(placer|échanger|passer|debug|réserve|aide)$');
        this.debugCommandFormat = new RegExp('^!debug$');
        this.isSingularCommandFormat = new RegExp('!debug|!réserve|!aide');
        this.isSingularCommandOutput = new RegExp('Impossible|Invalide|Syntaxe');
    }

    isMessageCommand(message: string): boolean {
        return this.messageFormat.test(message);
    }

    isKeywordValid(message: string): boolean {
        return this.keywordFormat.test(this.getCommandParameters(message)[0]);
    }

    getCommandParameters(message: string): string[] {
        return message.split(' ');
    }

    isDebugCommand(message: string): boolean {
        return this.debugCommandFormat.test(this.getCommandParameters(message)[0]);
    }

    checkCommand(message: string): CommandStatus {
        const isNotMessageCommand = !this.isMessageCommand(message);

        if (isNotMessageCommand) {
            this.commandOutput = message;
            this.chatAuthor = ChatAuthor.Player;
            return CommandStatus.SUCESS_MESSAGE;
        }

        const isKeywordValid: boolean = this.isKeywordValid(message);
        if (isKeywordValid) return CommandStatus.SUCESS_COMMAND_VALID_KEYWORD;
        this.commandOutput = 'Erreur de syntaxe';
        this.chatAuthor = ChatAuthor.System;
        return CommandStatus.ERROR_SYNTAX;
    }

    isSingularCommand(message: string): boolean {
        return this.isSingularCommandFormat.test(message);
    }

    isSingularOutput(message: string): boolean {
        return this.isSingularCommandOutput.test(message);
    }

    handleCommand(message: string, player: Player): Chat {
        let returnedChat: Chat;
        let commandStatus: CommandStatus = this.checkCommand(message);
        const isActivePlayer: boolean =
            this.gameModeService.match.activePlayer !== this.gameModeService.getPlayerIndex(player.name) &&
            !this.isSingularCommandFormat.test(message);

        if (isActivePlayer) {
            returnedChat = { message, author: ChatAuthor.Opponent };
            return returnedChat;
        }
        if (commandStatus === CommandStatus.SUCESS_COMMAND_VALID_KEYWORD) {
            const commandParameters: string[] = this.getCommandParameters(message);
            if (commandParameters[0] === '!passer') {
                this.gameModeService.match.numberOfConsecutivePasses++;
                this.gameModeService.match.numberOfTotalPasses++;
            } else this.gameModeService.match.numberOfConsecutivePasses = 0;
            switch (commandParameters[0]) {
                case PASS_COMMAND: {
                    commandStatus = this.passService.executeCommand(commandParameters);
                    this.commandOutput = this.passService.commandOutput;
                    this.chatAuthor = this.passService.chatAuthor;
                    break;
                }
                case PLACE_COMMAND: {
                    commandStatus = this.placeService.executeCommand(commandParameters);
                    this.commandOutput = this.placeService.commandOutput;
                    this.chatAuthor = this.placeService.chatAuthor;
                    break;
                }
                case EXCHANGE_COMMAND: {
                    commandStatus = this.exchangeService.executeCommand(commandParameters);
                    this.commandOutput = this.exchangeService.commandOutput;
                    this.chatAuthor = this.exchangeService.chatAuthor;
                    break;
                }
                case DEBUG_COMMAND: {
                    commandStatus = this.debugService.executeCommand(commandParameters, player);
                    this.commandOutput = this.debugService.commandOutput;
                    this.chatAuthor = this.debugService.chatAuthor;
                    break;
                }
                case RESERVE_COMMAND: {
                    commandStatus = this.reserveService.executeCommand(commandParameters, player);
                    this.commandOutput = this.reserveService.commandOutput;
                    this.chatAuthor = this.reserveService.chatAuthor;
                    break;
                }
                case HELP_COMMAND: {
                    commandStatus = this.helpService.executeCommand(commandParameters);
                    this.commandOutput = this.helpService.commandOutput;
                    this.chatAuthor = this.helpService.chatAuthor;
                    break;
                }
            }

            const isCommandValid = !this.isSingularCommandFormat.test(commandParameters[0]) || new RegExp('Impossible').test(this.commandOutput);
            if (isCommandValid) {
                this.gameModeService.match.parameters.timer = 1;
            }
        } else {
            if (new RegExp('Impossible').test(this.commandOutput)) this.gameModeService.match.parameters.timer = 1;
        }

        returnedChat = { message: this.commandOutput, author: this.chatAuthor };
        return returnedChat;
    }

    protected bindCommands(): void {
        this.commands
            .set(PASS_COMMAND, this.passService)
            .set(EXCHANGE_COMMAND, this.exchangeService)
            .set(DEBUG_COMMAND, this.debugService)
            .set(PLACE_COMMAND, this.placeService)
            .set(RESERVE_COMMAND, this.reserveService)
            .set(HELP_COMMAND, this.reserveService);
    }
}
