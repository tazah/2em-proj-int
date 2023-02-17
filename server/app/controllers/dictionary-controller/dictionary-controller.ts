import { HTTP_STATUS_CREATED, HTTP_STATUS_ERROR, HTTP_STATUS_OK } from '@app/../../common/constants/constants';
import { DictionnaryCollectionService } from '@app/services/database-services/dictionary-collection-service/dictionary-collection.service';
import { Dictionary, DictionaryInfo } from '@common/dictionary/dictionary';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class DictionaryController {
    router: Router;

    constructor(private readonly dictionnaryCollectionService: DictionnaryCollectionService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/title/:title', async (req: Request, res: Response) => {
            try {
                const dictionary = this.dictionnaryCollectionService.getDictionary(req.params.title);
                res.status(HTTP_STATUS_OK).json(dictionary);
            } catch (error) {
                res.status(HTTP_STATUS_ERROR).send(error);
            }
        });

        this.router.post('/sendDictionary', async (req: Request, res: Response) => {
            try {
                const dictionnary: Dictionary = req.body;
                const message = this.dictionnaryCollectionService.addDictionary(dictionnary);
                res.status(HTTP_STATUS_CREATED).send(message);
            } catch (error) {
                res.status(HTTP_STATUS_ERROR).json(error);
                return;
            }
        });

        this.router.get('/all', async (req: Request, res: Response) => {
            try {
                const dictionaries = this.dictionnaryCollectionService.getAllDictionaries();
                res.json(dictionaries);
            } catch (error) {
                res.status(HTTP_STATUS_ERROR).send(error);
            }
        });

        this.router.delete('/title/:title', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            try {
                this.dictionnaryCollectionService.deleteDictionary(req.params.title);
                res.sendStatus(HTTP_STATUS_OK);
            } catch (error) {
                res.status(HTTP_STATUS_ERROR).send(error);
            }
        });

        this.router.put('/modifyDictionary/:title', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const dictionnaryInfo: DictionaryInfo = req.body;
            try {
                this.dictionnaryCollectionService.modifyDictionary(req.params.title, dictionnaryInfo);
                res.sendStatus(HTTP_STATUS_OK);
            } catch (error) {
                res.status(HTTP_STATUS_ERROR).send(error);
            }
        });

        this.router.delete('/reset', async (req: Request, res: Response) => {
            try {
                this.dictionnaryCollectionService.resetDictionaries();

                res.sendStatus(HTTP_STATUS_OK);
            } catch (error) {
                res.status(HTTP_STATUS_ERROR).send(error);
            }
        });
    }
}
