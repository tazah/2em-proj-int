import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BestScore, BestScoreMode, FirstFiveBestScores } from '@common/best-score/best-score';
import { Dictionary, DictionaryInfo } from '@common/dictionary/dictionary';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { VirtualPlayerLevel, VirtualPlayerName } from './../../../../../common/virtual-player-name/virtual-player-name';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private baseUrl: string;

    constructor(private readonly http: HttpClient) {
        this.baseUrl = environment.serverUrl;
    }

    dictionariesGet(): Observable<DictionaryInfo[]> {
        return this.http
            .get<DictionaryInfo[]>(`${this.baseUrl}/dictionary/all`)
            .pipe(catchError(this.handleError<DictionaryInfo[]>('dictionariesGet')));
    }

    dictionaryGet(title: string): Observable<Dictionary> {
        return this.http
            .get<Dictionary>(`${this.baseUrl}/dictionary/title/${title}`)
            .pipe(catchError(this.handleError<Dictionary>(`dictionariesGet title=${title}`)));
    }

    dictionaryPost(dictionary: Dictionary): Observable<string> {
        return this.http
            .post<string>(`${this.baseUrl}/dictionary/sendDictionary`, dictionary)
            .pipe(catchError(this.handleError<string>('dictionaryPost')));
    }

    dictionaryPut(title: string, dictionary: DictionaryInfo): Observable<DictionaryInfo> {
        return this.http
            .put<DictionaryInfo>(`${this.baseUrl}/dictionary/modifyDictionary/${title}`, dictionary)
            .pipe(catchError(this.handleError<DictionaryInfo>('dictionaryPut')));
    }

    dictionaryDelete(title: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/dictionary/title/${title}`).pipe(catchError(this.handleError<void>('dictionaryDelete')));
    }

    virtualPlayerNamesGet(level: VirtualPlayerLevel): Observable<VirtualPlayerName[]> {
        return this.http
            .get<VirtualPlayerName[]>(`${this.baseUrl}/virtualPlayer/` + level + '/all')
            .pipe(catchError(this.handleError<VirtualPlayerName[]>('virtualPlayerNamesGet')));
    }

    virtualPlayerNamePut(oldName: string, newVirtualPlayer: VirtualPlayerName, level: VirtualPlayerLevel) {
        return this.http
            .put<VirtualPlayerName>(`${this.baseUrl}/virtualPlayer/` + level + `/modifyName/${oldName}`, newVirtualPlayer)
            .pipe(catchError(this.handleError<VirtualPlayerName>('virtualPlayerPut', newVirtualPlayer)));
    }

    virtualPlayerNameDelete(name: VirtualPlayerName, level: VirtualPlayerLevel) {
        return this.http
            .delete<void>(`${this.baseUrl}/virtualPlayer/` + level + `/delete/${name.name}`)
            .pipe(catchError(this.handleError<void>('virtualPlayerNameDelete')));
    }

    virtualPlayerNamePost(name: VirtualPlayerName, level: VirtualPlayerLevel): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/virtualPlayer/` + level + '/send', name)
            .pipe(catchError(this.handleError<void>('virtualPlayerNamePost')));
    }

    virtualPlayerNameReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/virtualPlayer/reset`).pipe(catchError(this.handleError<void>('virtualPlayerNameDelete')));
    }

    classicBestScoresGet(): Observable<FirstFiveBestScores[]> {
        return this.http
            .get<FirstFiveBestScores[]>(`${this.baseUrl}/bestScore/Classic/all`)
            .pipe(catchError(this.handleError<FirstFiveBestScores[]>('classicBestScoresGet')));
    }

    logBestScoresGet(): Observable<FirstFiveBestScores[]> {
        return this.http
            .get<FirstFiveBestScores[]>(`${this.baseUrl}/bestScore/Log/all`)
            .pipe(catchError(this.handleError<FirstFiveBestScores[]>('logBestScoresGet')));
    }

    bestScorePost(bestScore: BestScore, mode: BestScoreMode): Observable<BestScore> {
        return this.http
            .post<BestScore>(`${this.baseUrl}/bestScore/` + mode + '/send', bestScore)
            .pipe(catchError(this.handleError<BestScore>('bestScorePostClassic')));
    }

    bestScoreReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/bestScore/reset`).pipe(catchError(this.handleError<void>('bestScoreReset')));
    }

    dictionariesReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/dictionary/reset`).pipe(catchError(this.handleError<void>('dictionariesReset')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
