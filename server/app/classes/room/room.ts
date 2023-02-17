import { DatabaseService } from '@app/services/database-services/database-service/database.service';
import { Service } from 'typedi';
import { Player } from './../../../../common/player/player';
import { GameManager } from './../../services/game-manager/game-manager.service';

@Service()
export class Room {
    roomID: number = 0;
    players: Player[];
    roomType: number;
    gameManager: GameManager;

    constructor(roomInfo: number, typeRoom: number, dataBaseService: DatabaseService) {
        this.roomType = typeRoom;
        this.gameManager = new GameManager(dataBaseService);
        this.players = new Array<Player>();
        this.roomID = roomInfo;
    }
}
