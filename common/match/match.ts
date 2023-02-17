import { Objective } from './../../common/objective/objective';
import { Parameters } from './../parameters/parameters';
import { Player } from './../player/player';
import { PotentialWord } from './../potential-word/potential-word';
export enum State {
    Initialization,
    Start,
    End,
}
export enum MatchType {
    Solo,
    Multiplayer,
}
export interface Match {
    players: Player[];
    activePlayer: number;
    mode: string;
    state: State;
    type: MatchType;
    parameters: Parameters;
    debugOn: boolean;
    winner: number;
    gameOver: boolean;
    numberOfConsecutivePasses: number;
    numberOfTotalPasses: number;
    wordsOnBoard: PotentialWord[];
    boardConfiguration: string;
    publicObjectives: Objective[];
}
