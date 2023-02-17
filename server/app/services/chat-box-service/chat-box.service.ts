import { Chat } from '@common/chat/chat';
import { Service } from 'typedi';

@Service()
export class ChatBoxService {
    chatHistory: Chat[];

    constructor() {
        this.chatHistory = [];
    }

    addChat(chat: Chat): void {
        this.chatHistory.push(chat);
    }
}
