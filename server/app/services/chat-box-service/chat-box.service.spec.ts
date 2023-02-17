import { expect } from 'chai';
import { Container } from 'typedi';
import { Chat, ChatAuthor } from './../../../../common/chat/chat';
import { ChatBoxService } from './chat-box.service';

describe('ChatBoxService', () => {
    let service: ChatBoxService;
    let chat: Chat;

    beforeEach(async () => {
        service = Container.get(ChatBoxService);
    });

    it('should add chat (random chat)', () => {
        chat = { message: 'Hello world', author: ChatAuthor.Player };
        service.addChat(chat);
        expect(service.chatHistory).to.contain(chat);
    });

    it('should add chat (case message contain just a space)', () => {
        chat = { message: ' ', author: ChatAuthor.Player };
        service.addChat(chat);
        expect(service.chatHistory).to.contain(chat);
    });

    it('should add chat (case the author is the system)', () => {
        chat = { message: 'Hello world', author: ChatAuthor.System };
        service.addChat(chat);
        expect(service.chatHistory).to.contain(chat);
    });

    it('should add chat (case the author is the oponent)', () => {
        chat = { message: 'Hello world', author: ChatAuthor.Opponent };
        service.addChat(chat);
        expect(service.chatHistory).to.contain(chat);
    });
});
