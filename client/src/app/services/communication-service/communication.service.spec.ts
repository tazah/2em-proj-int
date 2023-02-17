import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { BestScore, BestScoreMode, FirstFiveBestScores } from '@common/best-score/best-score';
import { BEGINNER_VIRTUAL_PLAYERS } from '@common/constants/constants';
import { Dictionary, DictionaryInfo } from '@common/dictionary/dictionary';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common/virtual-player-name/virtual-player-name';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected virtualPlayer (HttpClient called once)', () => {
        const expectedVirtualPlayerNames: VirtualPlayerName[] = BEGINNER_VIRTUAL_PLAYERS;

        // check the content of the mocked call
        service.virtualPlayerNamesGet(VirtualPlayerLevel.Beginner).subscribe((response: VirtualPlayerName[]) => {
            expect(response).toEqual(expectedVirtualPlayerNames);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/virtualPlayer/beginner/all`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedVirtualPlayerNames);
    });

    it('should return expected classic BesScores (HttpClient called once)', () => {
        const expectedBestScores: FirstFiveBestScores[] = [
            { playerNames: ['player5'], score: 5 },
            { playerNames: ['player4'], score: 10 },
            { playerNames: ['player3'], score: 15 },
            { playerNames: ['player2'], score: 20 },
            { playerNames: ['player1'], score: 25 },
        ];

        // check the content of the mocked call
        service.classicBestScoresGet().subscribe((response: FirstFiveBestScores[]) => {
            expect(response).toEqual(expectedBestScores);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/bestScore/Classic/all`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedBestScores);
    });

    it('should return expected dictionaries (HttpClient called once)', () => {
        const expectedDictionaries: DictionaryInfo[] = [{ title: 'testDictionary', description: 'test dictionary' }];

        // check the content of the mocked call
        service.dictionariesGet().subscribe((response: DictionaryInfo[]) => {
            expect(response).toEqual(expectedDictionaries);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/dictionary/all`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedDictionaries);
    });

    it('should return expected dictionary (HttpClient called once)', () => {
        const expectedDictionary: Dictionary = { title: 'testDictionary', description: 'test dictionary', words: [] };

        // check the content of the mocked call
        service.dictionaryGet(expectedDictionary.title).subscribe((response: Dictionary) => {
            expect(response).toEqual(expectedDictionary);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/dictionary/title/testDictionary`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedDictionary);
    });

    it('should return expected log BesScores (HttpClient called once)', () => {
        const expectedBestScores: FirstFiveBestScores[] = [
            { playerNames: ['logplayer5'], score: 5 },
            { playerNames: ['logplayer4'], score: 10 },
            { playerNames: ['logplayer3'], score: 15 },
            { playerNames: ['logplayer2'], score: 20 },
            { playerNames: ['logplayer1'], score: 25 },
        ];

        // check the content of the mocked call
        service.logBestScoresGet().subscribe((response: FirstFiveBestScores[]) => {
            expect(response).toEqual(expectedBestScores);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/bestScore/Log/all`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedBestScores);
    });

    it('should not return virtual when sending a POST request (HttpClient called once)', () => {
        const virtualPlayer: VirtualPlayerName = { name: 'testVirtualPlayer' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNamePost(virtualPlayer, VirtualPlayerLevel.Beginner).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/virtualPlayer/beginner/send`, virtualPlayer.name);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(virtualPlayer);
    });

    it('should not return bestScore when sending a POST request (HttpClient called once)', () => {
        const bestScore: BestScore = { playerName: 'testname', score: 10 };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.bestScorePost(bestScore, BestScoreMode.Classic).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/bestScore/Classic/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(bestScore);
    });

    it('should not return dictionary when sending a POST request (HttpClient called once)', () => {
        const dictionary: Dictionary = { title: 'testDictionary', description: 'test dictionary', words: [] };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.dictionaryPost(dictionary).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionary/sendDictionary`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(dictionary);
    });

    it('should not return dictionary when sending a PUT request (HttpClient called once)', () => {
        const dictionary: DictionaryInfo = { title: 'testDictionary', description: 'test dictionary' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.dictionaryPut(dictionary.title, dictionary).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionary/modifyDictionary/testDictionary`);
        expect(req.request.method).toBe('PUT');
        // actually send the request
        req.flush(dictionary);
    });

    it('should not return Virtual player when sending a PUT request (HttpClient called once)', () => {
        const virtualPlayer: VirtualPlayerName = { name: 'virtualPlayerName' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNamePut('testVirtualPlayer', virtualPlayer, VirtualPlayerLevel.Beginner).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/virtualPlayer/beginner/modifyName/testVirtualPlayer`);
        expect(req.request.method).toBe('PUT');
        // actually send the request
        req.flush(virtualPlayer);
    });

    it('should not return dictionary delete when sending a Delete request (HttpClient called once)', () => {
        const dictionary: DictionaryInfo = { title: 'testDictionary', description: 'test dictionary' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.dictionaryDelete(dictionary.title).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionary/title/testDictionary`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should not return virtual player delete when sending a Delete request (HttpClient called once)', () => {
        const virtualPlayer: VirtualPlayerName = { name: 'virtualPlayerName' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNameDelete(virtualPlayer, VirtualPlayerLevel.Beginner).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/virtualPlayer/beginner/delete/virtualPlayerName`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should not return virtual players delete when sending a Delete request (HttpClient called once) for reset function', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNameReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/virtualPlayer/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should not return best scores delete when sending a Delete request (HttpClient called once) for reset function', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.bestScoreReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/bestScore/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should not return dictionaries delete when sending a Delete request (HttpClient called once) for reset function', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.dictionariesReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionary/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should handle http error safely', () => {
        service.virtualPlayerNamesGet(VirtualPlayerLevel.Beginner).subscribe((response: VirtualPlayerName[]) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/virtualPlayer/beginner/all`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });
});
