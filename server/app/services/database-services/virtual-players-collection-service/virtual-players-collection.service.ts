import {
    BEGINNER_VIRTUAL_PLAYERS,
    BEGINNER_VIRTUAL_PLAYERS_NAMES,
    EXPERT_VIRTUAL_PLAYERS,
    EXPERT_VIRTUAL_PLAYERS_NAMES,
    VIRTUAL_PLAYER_COLLECTION,
} from '@app/../../common/constants/constants';
import { VirtualPlayerLevel, VirtualPlayerName } from '@app/../../common/virtual-player-name/virtual-player-name';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './../database-service/database.service';

@Service()
export class VirtualPlayersCollection {
    constructor(private dataBaseService: DatabaseService) {}

    collection(level: VirtualPlayerLevel): Collection {
        return this.dataBaseService.database.collection(level + VIRTUAL_PLAYER_COLLECTION);
    }

    async getAllVirtualPlayersNames(level: VirtualPlayerLevel): Promise<VirtualPlayerName[]> {
        return await this.collection(level).find({}).toArray();
    }

    async modifyName(oldname: string, virtualPlayer: VirtualPlayerName, level: VirtualPlayerLevel): Promise<void> {
        if (this.validateVirtualPlayerName(virtualPlayer.name)) {
            await this.collection(level).findOneAndReplace({ name: oldname }, virtualPlayer);
        }
    }

    async addName(virtualPlayer: VirtualPlayerName, level: VirtualPlayerLevel): Promise<void> {
        if (this.validateVirtualPlayerName(virtualPlayer.name)) {
            this.collection(level).insertOne({ name: virtualPlayer.name });
        }
    }

    async deleteName(nameToDelete: string, level: VirtualPlayerLevel): Promise<void> {
        const nameExistsInList = BEGINNER_VIRTUAL_PLAYERS_NAMES.includes(nameToDelete, 0) || EXPERT_VIRTUAL_PLAYERS_NAMES.includes(nameToDelete, 0);
        if (!nameExistsInList) {
            this.collection(level).deleteOne({ name: nameToDelete });
        }
    }

    async deleteAllVirtualPlayers(level: VirtualPlayerLevel): Promise<void> {
        this.collection(level).deleteMany({});
    }

    async insertResetVirtualPlayers(level: VirtualPlayerLevel, names: VirtualPlayerName[]): Promise<void> {
        for (const name of names) this.collection(level).insertOne(name);
    }

    async resetAllVirtualPlayers() {
        await this.deleteAllVirtualPlayers(VirtualPlayerLevel.Beginner);
        await this.deleteAllVirtualPlayers(VirtualPlayerLevel.Expert);
        await this.insertResetVirtualPlayers(VirtualPlayerLevel.Beginner, BEGINNER_VIRTUAL_PLAYERS);
        await this.insertResetVirtualPlayers(VirtualPlayerLevel.Expert, EXPERT_VIRTUAL_PLAYERS);
    }

    validateVirtualPlayerName(name: string): boolean {
        name = name.replace(/\s/g, '');
        return !!name.length;
    }
}
