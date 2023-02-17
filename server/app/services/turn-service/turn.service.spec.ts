/*eslint-disable */
import { ChatBoxService } from '@app/services/chat-box-service/chat-box.service';
import { MatchType } from '@common/match/match';
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { VirtualPlayerService } from './../virtual-player-service/virtual-player.service';
import { TurnService } from './turn.service';

describe('TurnService', () => {
    let turnService: TurnService;
    let virtualPlayerService: VirtualPlayerService;
    let gameModeService: GameModeService;
    let chatBoxService: ChatBoxService;
    chai.use(spies);

    beforeEach(() => {
        turnService = Container.get(TurnService);
        virtualPlayerService = Container.get(VirtualPlayerService);
        gameModeService = Container.get(GameModeService);
        chatBoxService = Container.get(ChatBoxService);
        const parameters: Parameters = {
            dictionary: 'Mon dictionnaire',
            timer: 60,
            creatorName: 'Karim',
            isBoxTypeRandom: false,
            mode: GameModeType.classic,
            difficulty: VirtualPlayerDifficulty.Beginner,
        };
        gameModeService.initializeGame(parameters);
    });

    it('should be created', () => {
        expect(turnService).to.be.instanceOf(TurnService);
    });

    it('should call virtualPlayer.placeFirstTurn (case: first turn, virtual players turn)', () => {
        chai.spy.restore(virtualPlayerService, 'placeFirstTurn');
        chai.spy.on(virtualPlayerService, 'placeFirstTurn');
        gameModeService.match.activePlayer = 1;
        turnService.turnNumber = 5;
        turnService.controlTurn();
        expect(virtualPlayerService.placeFirstTurn).to.have.been.called;
    });

    it('should call virtualPlayer.placeFirstTurn (case: first turn, human players turn)', () => {
        chai.spy.restore(virtualPlayerService, 'placeFirstTurn');
        chai.spy.on(virtualPlayerService, 'placeFirstTurn');
        gameModeService.match.activePlayer = 0;
        turnService.turnNumber = 5;
        turnService.controlTurn();
        expect(virtualPlayerService.placeFirstTurn).to.have.been.called;
    });

    it('should call runCommandActionVirtualPlayer (case: not first turn, virtual players turn, middle full)', () => {
        chai.spy.on(virtualPlayerService, 'runCommandActionVirtualPlayer');
        turnService.turnNumber = 5;
        gameModeService.match.activePlayer = 1;
        gameModeService.board[7][7].letter = 'a';
        turnService.controlTurn();
        expect(virtualPlayerService.runCommandActionVirtualPlayer).to.have.been.called;
    });

    it('should call checkEndOfGame and display a message in chatBox if the game is over', () => {
        chai.spy.on(chatBoxService, 'addChat');
        turnService.turnNumber = 1;
        gameModeService.match.gameOver = true;
        turnService.controlTurn();
        expect(chatBoxService.addChat).to.have.been.called;
    });

    it('should change turn number if the multiplayer mode is activated', () => {
        chai.spy.restore(turnService, 'controlTurnMultiplayer');
        chai.spy.on(turnService, 'controlTurnMultiplayer');
        gameModeService.match.type = MatchType.Multiplayer;
        turnService.controlTurn();
        expect(turnService['turnNumber']).to.be.not.equal(0);
    });

    it('should update bestScores if match type is multiplayer and the turn is passed', () => {
        gameModeService.match.mode = 'LOG2990';
        gameModeService.match.type = MatchType.Multiplayer;
        turnService.updateBestScore();
        expect(turnService['turnNumber']).to.be.not.equal(0);
    });

    it('should return if its not bot turn', () => {
        gameModeService.match.type = MatchType.Solo;
        turnService.controlTurn();
        expect(virtualPlayerService.placeFirstTurn).to.not.have.been.called;
        expect(virtualPlayerService.runCommandActionVirtualPlayer).to.be.called;
    });
});
