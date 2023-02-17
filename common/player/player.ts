import { Chat } from '../chat/chat';
import { Objective } from './../../common/objective/objective';

export interface Player {
    tray: string[];
    name: string;
    score: number;
    socketId: string;
    roomId: number;
    gameType: number;
    debugOn: boolean;
    chatHistory: Chat[];
    privateOvjective: Objective;
}
