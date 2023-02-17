import { A_ASCII, CommandStatus, MAX_COLUMN_INDEX, MAX_ROW_INDEX } from '@app/../../common/constants/constants';
import { PotentialWord } from '@app/../../common/potential-word/potential-word';
import { Command } from '@app/classes/command/command';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { ScoreService } from '@app/services/score-service/score.service';
import { Service } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { Player } from './../../../../common/player/player';

@Service()
export class DebugService implements Command {
    commandOutput: string;
    chatAuthor: ChatAuthor;
    private debugCommandFormat: RegExp;

    constructor(private gameModeService: GameModeService, private scoreService: ScoreService) {
        this.debugCommandFormat = new RegExp('!debug|!Debug');
        this.commandOutput = '';
        this.chatAuthor = ChatAuthor.System;
    }

    executeCommand(debugParameters: string[], player: Player): CommandStatus {
        this.chatAuthor = ChatAuthor.System;
        const isDebugParametersValid: CommandStatus = this.isDebugParametersValid(debugParameters);
        if (isDebugParametersValid === CommandStatus.SUCESS_DEBUG_COMMAND_PARAMETERS_VALID) {
            player.debugOn = !player.debugOn;
            const isDebugOfFirstPlayerUpdated: boolean = player.gameType === 0;
            if (isDebugOfFirstPlayerUpdated) this.gameModeService.match.players[0].debugOn = player.debugOn;
            if (player.debugOn) {
                this.commandOutput = 'affichages de débogage activés';
                return CommandStatus.SUCESS_DEBUG_COMMAND_ACTIVATED;
            } else {
                this.commandOutput = 'affichages de débogage désactivés';
                return CommandStatus.SUCESS_DEBUG_COMMAND_DEACTIVATED;
            }
        } else {
            this.commandOutput = 'Commande Invalide';
            return CommandStatus.ERROR_DEBUG_COMMAND_PARAMETERS_INVALID;
        }
    }

    isDebugParametersValid(debugParameters: string[]): CommandStatus {
        const isParametersValid: boolean = debugParameters.length === 1 && this.debugCommandFormat.test(debugParameters[0]);
        return isParametersValid ? CommandStatus.SUCESS_DEBUG_COMMAND_PARAMETERS_VALID : CommandStatus.ERROR_DEBUG_COMMAND_PARAMETERS_INVALID;
    }

    createDebugMessage(direction: string, potentialWords: PotentialWord[]): string {
        const pickedWords = [];
        pickedWords.push(potentialWords[0]);
        for (let i = 0; i < 2 && i < potentialWords.length; i++) {
            const wordToPotentiallyPick = this.scoreService.pickPotentialWord(potentialWords);
            pickedWords.push(wordToPotentiallyPick);
        }
        let debugMessage = '';
        let debugWordMessage = '';
        let debugImpactedLetters = '';

        if (!this.gameModeService.match.players[0].debugOn) return '';

        for (const pickedWord of pickedWords) {
            for (let i = 0; i < pickedWord.word.length; i++) {
                const isDebugPossibleOnHorizontal: boolean =
                    direction === 'h' &&
                    !this.gameModeService.board[pickedWord.startPosition.row][Math.min(pickedWord.startPosition.column + i + 1, MAX_COLUMN_INDEX)]
                        .letter;

                const isDebugPossibleOnVertical: boolean =
                    direction === 'v' &&
                    !this.gameModeService.board[Math.min(pickedWord.startPosition.row + i, MAX_ROW_INDEX)][pickedWord.startPosition.column].letter;

                debugWordMessage += pickedWord.word[i];
                let startPositionOnRow = '';
                let startPositionOnColumn;

                if (isDebugPossibleOnHorizontal) {
                    startPositionOnRow = String.fromCharCode(pickedWord.startPosition.row + A_ASCII);
                    startPositionOnColumn = pickedWord.startPosition.column + i;
                    debugImpactedLetters += startPositionOnRow + startPositionOnColumn + ':' + pickedWord.word[i].toUpperCase() + '  ';
                }
                if (isDebugPossibleOnVertical) {
                    startPositionOnRow = String.fromCharCode(pickedWord.startPosition.row + i + 1 + A_ASCII);
                    startPositionOnColumn = pickedWord.startPosition.column;
                    debugImpactedLetters += startPositionOnRow + startPositionOnColumn + ':' + pickedWord.word[i].toUpperCase() + '  ';
                }
            }

            debugMessage += debugImpactedLetters + '\n';
            const wordScore = this.scoreService.countPotentialWordScore(
                pickedWord.word,

                pickedWord.startPosition.column,
            );
            debugMessage += debugWordMessage + ' (' + wordScore + ') \n \n ';
            debugImpactedLetters = '';
            debugWordMessage = '';
        }
        return debugMessage;
    }
}
