import { BestScore, BestScoreMode } from '@app/../../common/best-score/best-score';
import { BestScoreCollectionService } from '@app/services/database-services/best-score-collection-service/best-score-collection.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { HTTP_STATUS_CREATED, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } from './../../../../common/constants/constants';
@Service()
export class BestScoreController {
    router: Router;

    constructor(private readonly bestScoreCollectionService: BestScoreCollectionService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/Classic/send', async (req: Request, res: Response) => {
            const bestScore: BestScore = req.body;
            await this.bestScoreCollectionService.updateBestScore(bestScore, BestScoreMode.Classic).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.post('/Log/send', async (req: Request, res: Response) => {
            const bestScore: BestScore = req.body;
            await this.bestScoreCollectionService.updateBestScore(bestScore, BestScoreMode.Log).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.get('/Log/all', async (req: Request, res: Response) => {
            await this.bestScoreCollectionService
                .getFirstFiveBestScores(BestScoreMode.Log)
                .then((bestScoresLog) => res.status(HTTP_STATUS_OK).json(bestScoresLog));
        });

        this.router.get('/Classic/all', async (req: Request, res: Response) => {
            await this.bestScoreCollectionService
                .getFirstFiveBestScores(BestScoreMode.Classic)
                .then((bestScoresLog) => res.status(HTTP_STATUS_OK).json(bestScoresLog));
        });

        this.router.delete('/reset', async (req: Request, res: Response) => {
            await this.bestScoreCollectionService
                .resetAllBestScores()
                .then(() => {
                    res.status(HTTP_STATUS_NO_CONTENT).send();
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS_NOT_FOUND).send(error.message);
                });
        });
    }
}
