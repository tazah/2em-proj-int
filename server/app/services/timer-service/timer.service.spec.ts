/*eslint-disable */
import { GameModeType, Parameters, VirtualPlayerDifficulty } from '@common/parameters/parameters';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { LONGER_TICK, ONE_MINUTE } from './../../../../common/constants/constants';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let gameModeService: GameModeService;
    chai.use(spies);

    beforeEach(() => {
        service = Container.get(TimerService);
        gameModeService = Container.get(GameModeService);
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
        expect(service).to.be.instanceOf(TimerService);
    });

    it('should call decrementTimer()', () => {
        chai.spy.on(service, 'decrementTimer');
        service.decrementTimer();
        expect(service.decrementTimer).to.be.called;
    });

    it('should decrement timer by one second on call of decrementTimerByOne()', () => {
        gameModeService.match.activePlayer = 0;
        gameModeService.match.parameters.timer = ONE_MINUTE;
        service.decrementTimerByOne();
        expect(gameModeService.match.parameters.timer).to.equal(ONE_MINUTE - 1);
    });

    it('should decrement timer second condition', (done) => {
        service.timerOn = false;
        service.gameModeService.match.gameOver = true;
        service.decrementTimer();
        setTimeout(() => {
            expect(service.gameModeService.match.parameters.timer).to.be.equal(0);
            done();
        }, LONGER_TICK);
    });

    it('should stop timer and reset it to 0 when the timer is off', async () => {
        gameModeService.match.activePlayer = 0;
        gameModeService.match.parameters.timer = ONE_MINUTE;
        service.timerOn = false;
        expect(gameModeService.match.parameters.timer - ONE_MINUTE).to.equal(0);
    });

    it('should reset Timer to ONE_MINUTE when the timer is expired and it was the virtual player turn', () => {
        gameModeService.match.parameters.timer = -1;
        gameModeService.match.activePlayer = 1;
        service.reSetTimer(ONE_MINUTE);
        expect(gameModeService.match.parameters.timer).to.equal(ONE_MINUTE);
    });

    it('should reset Timer to One minute when the timer is expired and it was the human player turn', async () => {
        gameModeService.match.parameters.timer = -1;
        gameModeService.match.activePlayer = 0;
        service.reSetTimer(ONE_MINUTE);
        expect(gameModeService.match.parameters.timer).to.equal(ONE_MINUTE);
    });
});
