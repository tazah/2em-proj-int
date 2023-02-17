import { Player } from './../../../../../common/player/player';

export interface Room {
    roomId: number;
    players: Player[];
    gameType: number;
}
