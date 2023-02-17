import { BestScore, BestScoreMode, FirstFiveBestScores } from '@app/../../common/best-score/best-score';
import { Collection, Filter } from 'mongodb';
import { Service } from 'typedi';
import { DATABASE_COLLECTION, MAX_FIRST_FIVE_BEST_SCORES_LENGTH } from './../../../../../common/constants/constants';
import { DatabaseService } from './../database-service/database.service';

@Service()
export class BestScoreCollectionService {
    private classicBestScores: BestScore[];
    private logBestScores: BestScore[];
    constructor(private dataBaseService: DatabaseService) {
        this.logBestScores = [
            { playerName: 'logPlayer5', score: 100 },
            { playerName: 'logPlayer4', score: 200 },
            { playerName: 'logPlayer3', score: 250 },
            { playerName: 'logPlayer2', score: 300 },
            { playerName: 'logPlayer1', score: 400 },
        ];
        this.classicBestScores = [
            { playerName: 'player5', score: 1 },
            { playerName: 'player4', score: 200 },
            { playerName: 'player3', score: 250 },
            { playerName: 'player2', score: 300 },
            { playerName: 'player1', score: 400 },
        ];
    }

    collection(bestScoreMode: BestScoreMode): Collection<BestScore> {
        return this.dataBaseService.database.collection(bestScoreMode + DATABASE_COLLECTION);
    }

    async getAllBestScores(bestScoreMode: BestScoreMode): Promise<BestScore[]> {
        return await this.collection(bestScoreMode).find({}).sort({ score: -1 }).toArray();
    }

    async getFirstFiveBestScores(bestScoreMode: BestScoreMode): Promise<FirstFiveBestScores[]> {
        const allScores = await this.getAllBestScores(bestScoreMode);
        let bestScores: BestScore[] = [];

        bestScores = allScores;
        const firstFiveBestScores: FirstFiveBestScores[] = [];
        let bestScoresIndex = 0;
        let firstFiveBestScoresIndex = 0;
        firstFiveBestScores.push({ playerNames: [bestScores[bestScoresIndex].playerName], score: bestScores[bestScoresIndex].score });
        do {
            bestScoresIndex++;
            const isScoreTopFive: boolean = bestScores[bestScoresIndex].score === firstFiveBestScores[firstFiveBestScoresIndex].score;
            if (isScoreTopFive) {
                firstFiveBestScores[firstFiveBestScoresIndex].playerNames.push(bestScores[bestScoresIndex].playerName);
            } else {
                firstFiveBestScoresIndex++;
                firstFiveBestScores.push({
                    playerNames: [bestScores[bestScoresIndex].playerName],
                    score: bestScores[bestScoresIndex].score,
                });
            }
        } while (firstFiveBestScores.length < MAX_FIRST_FIVE_BEST_SCORES_LENGTH && bestScoresIndex < bestScores.length - 1);
        return firstFiveBestScores;
    }

    async addNewBestScore(bestScore: BestScore, bestScoreMode: BestScoreMode): Promise<void> {
        await this.collection(bestScoreMode).insertOne(bestScore);
    }

    async updateBestScore(bestScore: BestScore, bestScoreMode: BestScoreMode): Promise<void> {
        const filter: Filter<BestScore> = { playerName: bestScore.playerName, score: bestScore.score };
        this.collection(bestScoreMode)
            .findOneAndReplace(filter, bestScore)
            .then((searchedScore) => {
                if (searchedScore.value?.playerName !== bestScore.playerName) {
                    this.addNewBestScore(bestScore, bestScoreMode);
                }
            });
    }

    async deleteAllBestScores(bestScoreMode: BestScoreMode): Promise<void> {
        await this.collection(bestScoreMode).deleteMany({});
    }

    async insertResetBestScores(bestScoreMode: BestScoreMode, bestScores: BestScore[]): Promise<void> {
        for (const bestScore of bestScores) {
            this.collection(bestScoreMode).insertOne(bestScore);
        }
    }

    async resetAllBestScores() {
        await this.deleteAllBestScores(BestScoreMode.Classic);
        await this.deleteAllBestScores(BestScoreMode.Log);
        await this.insertResetBestScores(BestScoreMode.Classic, this.classicBestScores);
        await this.insertResetBestScores(BestScoreMode.Log, this.logBestScores);
    }
}
