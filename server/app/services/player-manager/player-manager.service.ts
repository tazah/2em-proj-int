import { Service } from 'typedi';
import { Objective, ObjectiveType } from './../../../../common/objective/objective';
import { Player } from './../../../../common/player/player';

@Service()
export class PlayerManager {
    players: Player[];

    constructor() {
        this.players = [];
    }

    getPlayerFromSocketID(socketId: string): Player {
        return this.players.find((p) => p.socketId === socketId) as Player;
    }

    addPlayer(playerName: string, socketIdSent: string): Player {
        let foundPlayer = this.getPlayerFromSocketID(socketIdSent);
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };

        if (foundPlayer === undefined) {
            const player: Player = {
                name: playerName,
                tray: [],
                score: 0,
                socketId: socketIdSent,
                roomId: -1,
                gameType: 0,
                debugOn: false,
                chatHistory: [],
                privateOvjective: initialObjective,
            };
            foundPlayer = player;

            this.players.push(player);
        } else {
            foundPlayer.name = playerName;
        }

        return foundPlayer;
    }

    deletePlayer(socketIdSent: string): void {
        const player: Player = this.getPlayerFromSocketID(socketIdSent);
        this.players.splice(this.players.indexOf(player), 1);
    }
}
