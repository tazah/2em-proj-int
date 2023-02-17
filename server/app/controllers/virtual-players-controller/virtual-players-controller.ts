import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { VirtualPlayerLevel, VirtualPlayerName } from './../../../../common/virtual-player-name/virtual-player-name';
import { VirtualPlayersCollection } from './../../services/database-services/virtual-players-collection-service/virtual-players-collection.service';

const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NO_CONTENT = 202;
const HTTP_STATUS_NOT_FOUND = 203;

@Service()
export class VirtualPlayerController {
    router: Router;

    constructor(private readonly virtualPlayersCollection: VirtualPlayersCollection) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/expert/send', async (req: Request, res: Response, next) => {
            const name: VirtualPlayerName = req.body as VirtualPlayerName;
            await this.virtualPlayersCollection
                .addName(name, VirtualPlayerLevel.Expert)
                .then(() => res.sendStatus(HTTP_STATUS_CREATED))
                .catch((error) => next(error));
        });

        this.router.post('/beginner/send', async (req: Request, res: Response, next) => {
            const name: VirtualPlayerName = req.body as VirtualPlayerName;
            await this.virtualPlayersCollection
                .addName(name, VirtualPlayerLevel.Beginner)
                .then(() => res.sendStatus(HTTP_STATUS_CREATED))
                .catch((error) => next(error));
        });

        this.router.get('/expert/all', async (req: Request, res: Response, next) => {
            await this.virtualPlayersCollection
                .getAllVirtualPlayersNames(VirtualPlayerLevel.Expert)
                .then((names) => res.status(HTTP_STATUS_OK).json(names))
                .catch((error) => next(error));
        });

        this.router.get('/beginner/all', async (req: Request, res: Response, next) => {
            await this.virtualPlayersCollection
                .getAllVirtualPlayersNames(VirtualPlayerLevel.Beginner)
                .then((names) => res.status(HTTP_STATUS_OK).json(names))
                .catch((error) => next(error));
        });

        this.router.put('/beginner/modifyName/:oldName', async (req: Request, res: Response, next) => {
            const newVirtualPlayer: VirtualPlayerName = req.body;
            this.virtualPlayersCollection
                .modifyName(req.params.oldName, newVirtualPlayer, VirtualPlayerLevel.Beginner)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.put('/expert/modifyName/:oldName', async (req: Request, res: Response, next) => {
            const newVirtualPlayer: VirtualPlayerName = req.body;
            this.virtualPlayersCollection
                .modifyName(req.params.oldName, newVirtualPlayer, VirtualPlayerLevel.Expert)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.delete('/beginner/delete/:name', async (req: Request, res: Response, next) => {
            this.virtualPlayersCollection
                .deleteName(req.params.name, VirtualPlayerLevel.Beginner)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.delete('/expert/delete/:name', async (req: Request, res: Response, next) => {
            this.virtualPlayersCollection
                .deleteName(req.params.name, VirtualPlayerLevel.Expert)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.delete('/reset', async (req: Request, res: Response) => {
            await this.virtualPlayersCollection
                .resetAllVirtualPlayers()
                .then(() => {
                    res.status(HTTP_STATUS_NO_CONTENT).send();
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS_NOT_FOUND).send(error.message);
                });
        });
    }
}
