import { BestScore, BestScoreMode } from '@app/../../common/best-score/best-score';
import { ChatAuthor } from '@app/../../common/chat/chat';
import { MatchType } from '@app/../../common/match/match';
import { ChatBoxService } from '@app/services/chat-box-service/chat-box.service';
import { BestScoreCollectionService } from '@app/services/database-services/best-score-collection-service/best-score-collection.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { Service } from 'typedi';

@Service()
export class TurnService {
    turnNumber: number;

    constructor(
        public gameModeService: GameModeService,
        private virtualPlayer: VirtualPlayerService,
        public chatBoxService: ChatBoxService,
        private bestScoreCollectionService: BestScoreCollectionService,
    ) {
        this.turnNumber = 0;
    }

    controlTurn(): void {
        if (this.turnNumber === 0) this.gameModeService.match.activePlayer = Math.floor(Math.random() * 2);
        if (this.gameModeService.checkEndOfGame()) {
            const gameOverMessage =
                'Fin de partie - lettres restantes \n' +
                this.gameModeService.match.players[0].name +
                ' : ' +
                this.gameModeService.match.players[0].tray.join(' ') +
                '\n' +
                this.gameModeService.match.players[1].name +
                ' : ' +
                this.gameModeService.match.players[1].tray.join(' ');
            this.chatBoxService.addChat({ message: gameOverMessage, author: ChatAuthor.System });
            this.updateBestScore();
        } else {
            switch (this.gameModeService.match.type) {
                case MatchType.Solo:
                    this.controlTurnSolo();
                    break;
                case MatchType.Multiplayer:
                    break;
            }
        }
        this.turnNumber++;
    }

    controlTurnSolo(): void {
        this.virtualPlayer.tray = this.gameModeService.match.players[1].tray;
        if (this.gameModeService.match.activePlayer === 1) {
            if (this.gameModeService.board[7][7].letter.length === 0) {
                this.virtualPlayer.placeFirstTurn();
            } else {
                this.virtualPlayer.runCommandActionVirtualPlayer();
            }
        }
    }

    async updateBestScore(): Promise<void> {
        const bestScoreMode = this.gameModeService.match.mode === 'classique' ? BestScoreMode.Classic : BestScoreMode.Log;
        if (this.gameModeService.match.type === MatchType.Multiplayer) {
            for (const player of this.gameModeService.match.players) {
                const bestScoresForMatch: BestScore = { playerName: player.name, score: player.score };
                await this.bestScoreCollectionService.addNewBestScore(bestScoresForMatch, bestScoreMode);
            }
        } else {
            const bestScoresForMatch: BestScore = {
                playerName: this.gameModeService.match.players[0].name,
                score: this.gameModeService.match.players[0].score,
            };
            this.bestScoreCollectionService.addNewBestScore(bestScoresForMatch, bestScoreMode);
        }
    }
}
