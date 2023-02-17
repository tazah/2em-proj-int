import {
    A_ASCII,
    CommandStatus,
    MAX_COLUMN_INDEX,
    MAX_ROW_INDEX,
    ONE_SECOND,
    ONE_SECOND_IN_MILLISECONDS,
    TRAY_SIZE,
} from '@app/../../common/constants/constants';
import { Coordinates } from '@app/../../common/coordinates/coordinates';
import { ObjectiveParameters } from '@app/../../common/objective-parameters/objective-parameters';
import { PlaceCommandParameters } from '@app/classes/place-command-parameters/place-command-parameters';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { ObjectivesService } from '@app/services/objectives-service/objectives.service';
import { ValidationService } from '@app/services/validation-service/validation.service';
import { Player } from '@common/player/player';
import { Service } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { MatchType } from './../../../../common/match/match';
import { GameModeType } from './../../../../common/parameters/parameters';

@Service()
export class PlaceService {
    commandOutput: string;
    chatAuthor: ChatAuthor;
    private placeParamsCoordinatesFormat: RegExp;
    private placeParamsWordFormat: RegExp;

    constructor(
        private gameModeService: GameModeService,
        private validationService: ValidationService,
        private objectivesService: ObjectivesService,
    ) {
        this.chatAuthor = ChatAuthor.System;
        this.commandOutput = '';
        this.placeParamsCoordinatesFormat = new RegExp('^[a-o]([1-9]|1[0-5])(h|v)$');
        this.placeParamsWordFormat = new RegExp('^[a-zA-Z]{2,15}$');
    }

    isPlaceParametersValid(message: string[]): CommandStatus {
        if (message.length !== 3) return CommandStatus.ERROR_PLACE_PARAMETERS_INVALID;
        const isParamsRespectFormat: boolean = this.placeParamsCoordinatesFormat.test(message[1]) && this.placeParamsWordFormat.test(message[2]);
        return isParamsRespectFormat ? CommandStatus.SUCCESS_PLACE_COMMAND_PARAMETERS_VALID : CommandStatus.ERROR_PLACE_PARAMETERS_INVALID;
    }

    getPlaceParameters(params: string[]): PlaceCommandParameters {
        const placeParams: PlaceCommandParameters = {
            row: Number(params[1][0].toUpperCase().charCodeAt(0) - A_ASCII),
            column: Number(params[1].substr(1, params[1].length - 2)),
            direction: params[1][params[1].length - 1],
            word: params[params.length - 1],
        };
        return placeParams;
    }

    executeCommand(params: string[]): CommandStatus {
        const whiteKey = new RegExp('^[A-Z]{1}$');
        this.chatAuthor = ChatAuthor.System;
        params[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Source: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript

        const isPlaceParametersValid: CommandStatus = this.isPlaceParametersValid(params);
        const placeParams: PlaceCommandParameters = this.getPlaceParameters(params);

        const startPosition: Coordinates = {
            row: placeParams.row,
            column: placeParams.column,
        };

        if (isPlaceParametersValid !== CommandStatus.SUCCESS_PLACE_COMMAND_PARAMETERS_VALID) {
            this.commandOutput = 'Commande Invalide';
            return CommandStatus.ERROR_PLACE_PARAMETERS_INVALID;
        }

        if (this.isPlacementPossible(placeParams) !== CommandStatus.SUCESS_PLACE_COMMAND_PLACEMENT_POSSIBLE) {
            this.commandOutput = 'Commande Impossible';
            return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
        }

        const humanPlayerCommandStatus: CommandStatus = this.validationService.validateWordForHumanPlayer(placeParams);
        const trayToSave = this.gameModeService.match.players[this.gameModeService.match.activePlayer].tray;
        const backupPartBoard = JSON.parse(JSON.stringify(this.gameModeService.board));
        const activePlayer = JSON.parse(JSON.stringify(this.gameModeService.match.activePlayer));
        const lettersToKeep: string[] = this.placeLettersOnBoard(startPosition, placeParams.word, placeParams.direction, trayToSave);
        const isHumanPlayerPlacementValid =
            (this.gameModeService.match.type === MatchType.Solo && this.gameModeService.match.activePlayer) ||
            humanPlayerCommandStatus !== CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
        const isHumanPlayerPlacementInvalid = !isHumanPlayerPlacementValid;

        if (isHumanPlayerPlacementInvalid) {
            let timer = ONE_SECOND;

            const interval = setInterval(() => {
                timer--;
                if (timer < 0) {
                    this.gameModeService.board = backupPartBoard;
                    for (const letter of lettersToKeep) {
                        this.gameModeService.match.players[activePlayer].tray = whiteKey.test(letter)
                            ? this.gameModeService.match.players[activePlayer].tray.concat('*')
                            : this.gameModeService.match.players[activePlayer].tray.concat(letter);
                    }

                    clearInterval(interval);
                }
            }, ONE_SECOND_IN_MILLISECONDS);
            this.commandOutput = 'Commande Impossible effacer apres 3 secondes';
            return CommandStatus.ERROR_PLACE_COMMAND_INVALID_THREE_SECONDS;
        } else {
            this.gameModeService.match.players[activePlayer].score += this.validationService.calculateScoreOfTurn(placeParams);

            this.commandOutput = params.join(' ');
            if (this.gameModeService.match.players[activePlayer].tray.length === 0)
                this.gameModeService.match.players[activePlayer].score = this.validationService.addBonusToScore(
                    this.gameModeService.match.players[activePlayer].score,
                );
            this.gameModeService.match.players[activePlayer].tray = this.gameModeService.match.players[activePlayer].tray.concat(
                this.gameModeService.bank.draw(TRAY_SIZE - this.gameModeService.match.players[activePlayer].tray.length),
            );
        }
        this.chatAuthor = ChatAuthor.Player;

        if (this.gameModeService.match.parameters.mode === GameModeType.log2990)
            this.checkObjectives(placeParams, this.gameModeService.match.players[this.gameModeService.match.activePlayer]);

        return CommandStatus.SUCESS_PLACE_COMMAND;
    }

    isPlacementPossible(params: PlaceCommandParameters): CommandStatus {
        if (this.gameModeService.match.activePlayer) return CommandStatus.SUCESS_PLACE_COMMAND_PLACEMENT_POSSIBLE;
        const isPlacementHorizontallyPossible: boolean =
            params.word.length > Math.abs(params.column - 1 - MAX_COLUMN_INDEX) && params.direction === 'h';
        const isPlacementVerticallyPossible: boolean = Math.abs(MAX_ROW_INDEX - params.row + 1) < params.word.length && params.direction === 'v';
        const isPlacementPossible: boolean = isPlacementHorizontallyPossible || isPlacementVerticallyPossible;
        if (isPlacementPossible) {
            this.commandOutput = 'Commande Impossible';

            return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
        }

        const tray: string[] = this.gameModeService.match.players[this.gameModeService.match.activePlayer].tray;

        let coordinates: Coordinates = {
            row: params.row,
            column: Math.max(0, params.column - 1),
        };

        for (const letter of params.word) {
            const boardLetter: string = this.gameModeService.board[coordinates.row][coordinates.column].letter;
            const isPossibleToPlaceLetter: boolean = tray.includes(letter) || boardLetter === letter;
            const isImpossibleToPlaceLetter = !isPossibleToPlaceLetter;

            if (isImpossibleToPlaceLetter) {
                return CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE;
            }

            if (params.direction === 'h') coordinates.column++;
            else coordinates.row++;
        }

        coordinates = {
            row: params.row,
            column: Math.max(0, params.column - 1),
        };

        return CommandStatus.SUCESS_PLACE_COMMAND_PLACEMENT_POSSIBLE;
    }

    checkObjectives(placeCommandParameters: PlaceCommandParameters, activePlayer: Player): void {
        const objectiveParameters: ObjectiveParameters = {
            placeParameters: placeCommandParameters,
            impactedWords: this.validationService.getImpactedWords(
                placeCommandParameters.column,
                placeCommandParameters.row,
                placeCommandParameters.word,
            ),
        };
        this.gameModeService.match.publicObjectives = this.objectivesService.checkPublicObjectives(objectiveParameters, activePlayer);
        this.objectivesService.checkPrivateObjective(objectiveParameters, activePlayer);
    }

    placeLettersOnBoard(startPosition: Coordinates, word: string, direction: string, trayToSave: string[]): string[] {
        let lettersToPlace: string[] = [];
        const whiteKey = new RegExp('^[A-Z]{1}$');

        for (const letter of word) {
            if (
                this.gameModeService.board[startPosition.row][Math.max(0, startPosition.column - 1)] !== undefined &&
                this.gameModeService.board[startPosition.row][Math.max(0, startPosition.column - 1)].letter !== letter
            ) {
                this.gameModeService.board[startPosition.row][Math.max(0, startPosition.column - 1)].letter = letter;
                const lettersToRemoveFromTray = whiteKey.test(letter) ? letter : trayToSave.splice(trayToSave.indexOf(letter), 1)[0];
                if (whiteKey.test(letter)) trayToSave.splice(trayToSave.indexOf('*'), 1);
                lettersToPlace = lettersToPlace.concat(lettersToRemoveFromTray);
            }
            if (direction === 'h') startPosition.column++;
            else startPosition.row++;
        }

        return lettersToPlace;
    }
}
