/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Objective, ObjectiveType } from '@common/objective/objective';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import * as chai from 'chai';
import { expect } from 'chai';
import { Container } from 'typedi';
import { ChatAuthor } from './../../../../common/chat/chat';
import { CommandStatus } from './../../../../common/constants/constants';
import { Player } from './../../../../common/player/player';
import { PlaceCommandParameters } from './../../classes/place-command-parameters/place-command-parameters';
import { CommandService } from './../command-service/command.service';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { ObjectivesService } from './../objectives-service/objectives.service';
import { PlaceService } from './place.service';

describe('PlaceService', () => {
    let service: PlaceService;
    let params: PlaceCommandParameters;
    let gameMode: GameModeService;
    let commandService: CommandService;
    let objectiveService: ObjectivesService;
    let player: Player;

    beforeEach(() => {
        service = Container.get(PlaceService);
        gameMode = Container.get(GameModeService);
        commandService = Container.get(CommandService);
        objectiveService = Container.get(ObjectivesService);
        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        gameMode.initializeGame(parameters);
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(PlaceService);
    });

    it('isPlacementPossible should return commande impossible case the placement is impossible', () => {
        params = {
            row: 4,
            column: 15,
            direction: 'h',
            word: 'justara',
        };
        gameMode.match.activePlayer = 0;
        gameMode.match.players[gameMode.match.activePlayer].tray = ['a', 'j', 'u', 's', 't', 'a', 'r'];
        player = gameMode.match.players[gameMode.match.activePlayer];
        commandService.handleCommand('!placer d15h justara', player);
        expect(commandService.commandOutput).to.equal('Commande Impossible');
    });

    it('should verify if row is increased', () => {
        params = {
            row: 3,
            column: 5,
            direction: 'v',
            word: 'just',
        };
        gameMode.match.activePlayer = 0;
        gameMode.match.players[gameMode.match.activePlayer].tray = ['a', 'j', 'u', 's', 't', 'a', 'r'];

        expect(service.isPlacementPossible(params)).to.be.equal(CommandStatus.SUCESS_PLACE_COMMAND_PLACEMENT_POSSIBLE);
    });

    it('should have valid params for invalid vertical placement', () => {
        params = {
            row: 3,
            column: 5,
            direction: 'v',
            word: 'just',
        };
        gameMode.match.activePlayer = 0;
        gameMode.board[3][5].letter = 'a';
        gameMode.match.players[gameMode.match.activePlayer].tray = ['a', 'j', 'u', 's', 't', 'a', 'r'];
        player = gameMode.match.players[gameMode.match.activePlayer];
        commandService.handleCommand('!placer c5v just', player);
        expect(service.isPlacementPossible(params)).to.be.equal(CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE);
    });

    it('isPlaceParametereValid function should return error place parameter invalid if the command message does not respect syntaxe', () => {
        const command: string[] = ['!placer', 'hhh'];
        const commandStatus: CommandStatus = service.isPlaceParametersValid(command);
        expect(commandStatus).to.be.equal(6);
    });

    it('isPlaceParametereValid function should return error place parameter invalid if does not respect format of the command', () => {
        const command: string[] = ['!placer', 'h20h', 'aa'];
        const commandStatus: CommandStatus = service.isPlaceParametersValid(command);
        expect(commandStatus).to.be.equal(6);
    });

    it('should not place a letter that is not in tray', () => {
        params = {
            row: 8,
            column: 8,
            direction: 'h',
            word: 'zed',
        };
        gameMode.match.activePlayer = 0;
        gameMode.match.players[gameMode.match.activePlayer].tray = ['a', 'j', 'u', 's', 't', 'a', 'r'];
        player = gameMode.match.players[gameMode.match.activePlayer];
        expect(service.isPlacementPossible(params)).to.be.equal(CommandStatus.ERROR_PLACE_PLACEMENT_IMPOSSIBLE);
    });
    it('should remove invalid word from board when played (case: horizontal placement)', () => {
        gameMode.match.activePlayer = 0;
        gameMode.match.players[gameMode.match.activePlayer].tray = ['x', 'z', 'y', 'w', 't', 'a', 'r'];
        player = gameMode.match.players[gameMode.match.activePlayer];
        expect(commandService.handleCommand('!placer h8h wyxz', player)).to.be.deep.equal({
            message: 'Commande Impossible effacer apres 3 secondes',
            author: ChatAuthor.System,
        });
    });

    it('checkObjectives should call checkPublicObjectives', () => {
        chai.spy.on(objectiveService, 'checkPrivateObjective');
        const placeParameter: PlaceCommandParameters = {
            row: 1,
            column: 2,
            direction: 'h',
            word: 'ali',
        };
        const initialObjective: Objective = {
            index: 2,
            description: 'place a word which lenghth is above ten',
            name: 'lenghtAboveTen',
            type: ObjectiveType.Private,
            isReached: true,
            score: 0,
            isPicked: false,
        };
        const player1: Player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        service.checkObjectives(placeParameter, player1);

        expect(objectiveService.checkPrivateObjective).to.be.called();
    });

    it('should return true placement possible when active player is virtual player', () => {
        gameMode.match.activePlayer = 1;
        params = {
            row: 8,
            column: 8,
            direction: 'h',
            word: 'zed',
        };
        expect(service.isPlacementPossible(params)).to.be.equal(CommandStatus.SUCESS_PLACE_COMMAND_PLACEMENT_POSSIBLE);
    });
});
