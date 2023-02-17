import { Room } from '@app/classes/room/room';
import { Service } from 'typedi';
import { DatabaseService } from './../database-services/database-service/database.service';

@Service()
export class RoomManager {
    rooms: Room[];
    currentRoomID: number;

    constructor() {
        this.rooms = new Array<Room>();
        this.currentRoomID = this.rooms.length;
    }

    findRoom(roomId: number): Room {
        const aRooms: Room[] = this.rooms.filter((el) => {
            return el.roomID === roomId;
        });

        if (aRooms.length > 0) {
            const room = aRooms[0];
            return room;
        }

        return aRooms[0];
    }

    addRoom(roomType: number, dataBaseService: DatabaseService): Room {
        this.currentRoomID = this.rooms.length;
        const room: Room = new Room(this.currentRoomID, roomType, dataBaseService);
        this.rooms.push(room);
        return room;
    }
}
