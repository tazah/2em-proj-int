import { TestBed } from '@angular/core/testing';
import { ChatAuthor } from '@common/chat/chat';
import { TEST_SUM_I } from '@common/constants/constants';
import { LocalGameHandlerService } from './local-game-handler.service';
describe('LocalGameHandlerService', () => {
    let service: LocalGameHandlerService;
    let localGame: LocalGameHandlerService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LocalGameHandlerService);
        localGame = TestBed.inject(LocalGameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should swap players from player 0 to player 1 on call of swapPlayers()', () => {
        service.match.activePlayer = 0;
        service.swapPlayers();
        expect(service.match.activePlayer).toBe(1);
    });

    it('should swap the chatAuthor on call of swapChat() if the Author is Player', () => {
        service.chatHistory.push({ message: 't', author: ChatAuthor.Player });
        service.chatHistory.push({ message: 'k', author: ChatAuthor.Opponent });
        service.swapChat();
        expect(service.chatHistory[0].author).toBe(ChatAuthor.Opponent);
    });

    it('should swap the chatAuthor on call of swapChat() if the Author is Opponent', () => {
        service.chatHistory.push({ message: 't', author: ChatAuthor.Opponent });
        service.chatHistory.push({ message: 'k', author: ChatAuthor.Opponent });
        service.chatHistory.push({ message: 'k', author: ChatAuthor.System });
        service.swapChat();
        expect(service.chatHistory[0].author).toBe(ChatAuthor.Player);
    });

    it('should return the same sum on call of getReserveNumber()', () => {
        localGame.bank.set('a', { quantity: 9, weight: 1 });
        localGame.bank.set('b', { quantity: 6, weight: 2 });
        const sum = service.getReserveNumber();
        expect(sum).toBe(TEST_SUM_I);
    });
});
