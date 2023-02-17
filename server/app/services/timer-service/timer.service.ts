import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { Service } from 'typedi';
import { ONE_SECOND_IN_MILLISECONDS, TWENTY_SECONDS } from './../../../../common/constants/constants';
import { MatchType } from './../../../../common/match/match';
import { TurnService } from './../turn-service/turn.service';

@Service()
export class TimerService {
    timerOn: boolean;

    constructor(public gameModeService: GameModeService, public turnService: TurnService) {
        this.timerOn = false;
    }

    decrementTimerByOne(): void {
        this.gameModeService.match.parameters.timer--;
    }

    decrementTimer(): void {
        const timeRemaining = this.gameModeService.match.parameters.timer;
        this.gameModeService.match.parameters.timer = timeRemaining;

        const interval = setInterval(() => {
            if (this.gameModeService.match.parameters.timer === timeRemaining) this.turnService.controlTurn();
            this.decrementTimerByOne();
            this.reSetTimer(timeRemaining);

            const isTimerOffOrGameIsOver = !this.timerOn || this.gameModeService.match.gameOver;

            if (isTimerOffOrGameIsOver) {
                this.gameModeService.match.parameters.timer = 0;
                clearInterval(interval);
                return;
            }
        }, ONE_SECOND_IN_MILLISECONDS);
    }

    reSetTimer(timeRemaining: number): void {
        const isTimeToResetTimer =
            this.gameModeService.match.parameters.timer < 0 ||
            (this.gameModeService.match.activePlayer &&
                this.gameModeService.match.type === MatchType.Solo &&
                this.gameModeService.match.parameters.timer < timeRemaining - TWENTY_SECONDS);

        if (isTimeToResetTimer) {
            this.gameModeService.match.activePlayer = 1 - this.gameModeService.match.activePlayer;
            this.gameModeService.match.parameters.timer = timeRemaining;
        }
    }

    launchTimer(): void {
        this.timerOn = true;
        this.decrementTimer();
    }
}
// source : https://www.freecodecamp.org/news/how-to-create-a-countdown-timer/
