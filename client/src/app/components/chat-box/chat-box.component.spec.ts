import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';
import { Chat, ChatAuthor } from '@common/chat/chat';
import { TICK_I } from '@common/constants/constants';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let roomService: RoomService;
    let visualPlacementService: VisualPlacementService;
    let localGame: LocalGameHandlerService;
    let myScrollContainer: jasmine.SpyObj<ElementRef>;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            providers: [RoomService, LocalGameHandlerService, DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();

        roomService = TestBed.inject(RoomService);
        visualPlacementService = TestBed.inject(VisualPlacementService);
        localGame = TestBed.inject(LocalGameHandlerService);
        myScrollContainer = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        myScrollContainer.nativeElement = { scrollTop: 10, scrollHeigh: 11 };
        jasmine.clock().install();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        component.myScrollContainer = myScrollContainer;
        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should scrolldown', () => {
        spyOn(component, 'scrollToBottom');
        component.scrollToBottom();
        expect(component.scrollToBottom).toHaveBeenCalled();
    });

    it('should call send message when onkeyup receive value ', () => {
        component.myScrollContainer = new ElementRef({ nativeElement: '' });
        spyOn(roomService, 'sendMessage');
        const event: Event = { target: { value: '!passer' } } as unknown as Event;
        component.onKeyup(event);
        expect(roomService.sendMessage).toHaveBeenCalled();
    });

    it('should not call send message when onkeyup receive value ', () => {
        spyOn(roomService, 'sendMessage');
        const event: Event = { target: { value: '   ' } } as unknown as Event;
        component.onKeyup(event);
        expect(roomService.sendMessage).not.toHaveBeenCalled();
    });

    it('should add a message ', () => {
        spyOn(component, 'addChat');
        component.addMessage('hello');
        expect(component.addChat).toHaveBeenCalled();
    });

    it('should add chat ', () => {
        const chat: Chat = { message: 'hello', author: ChatAuthor.System };
        component.addChat(chat);
        expect(component.chatHistory).toContain(chat);
    });

    it('should call visualPlacementService.cancelPlacement() on click outside ', () => {
        spyOn(visualPlacementService, 'cancelPlacement');
        component.clickInsideTray();
        expect(visualPlacementService.cancelPlacement).toHaveBeenCalled();
    });

    it('should call scrollToBottom() and removeWrongPlacement() if roomService.chatSubject.next() is called', () => {
        spyOn(component, 'scrollToBottom');
        spyOn(component, 'removeWrongPlacement');
        roomService.chatSubject.next();
        expect(component.scrollToBottom).toHaveBeenCalled();
        expect(component.removeWrongPlacement).toHaveBeenCalled();
    });

    it('should emit a socket if removeWrongPlacement() is called ', () => {
        const chat: Chat = {
            message: '',
            author: ChatAuthor.Player,
        };
        const chat1: Chat = {
            message: 'Commande Impossible effacer apres 3 secondes',
            author: ChatAuthor.Player,
        };

        localGame.chatHistory.push(chat);
        localGame.chatHistory.push(chat1);
        spyOn(roomService.socket, 'emit');
        component.removeWrongPlacement();
        jasmine.clock().tick(TICK_I);
        expect(roomService.socket.emit).toHaveBeenCalled();
    });

    it('should emit a socket if removeWrongPlacement() is called case ', () => {
        const chat: Chat = {
            message: 'hi',
            author: ChatAuthor.Player,
        };
        const chat1: Chat = {
            message: 'hello',
            author: ChatAuthor.Opponent,
        };

        localGame.chatHistory.push(chat);
        localGame.chatHistory.push(chat1);
        localGame.chatHistory[localGame.chatHistory.length - 1].message = 'autre';
        spyOn(roomService.socket, 'emit');
        component.removeWrongPlacement();
        jasmine.clock().tick(TICK_I);
        expect(roomService.socket.emit).not.toHaveBeenCalled();
    });

    // it('should call removeWrongPlacement() on ngOnDestroy()', () => {
    //     spyOn(roomService, 'getChatObservable').and.returnValue());
    //     spyOn(component, 'removeWrongPlacement');
    //     component.ngOnDestroy();
    //     expect(component.removeWrongPlacement).toHaveBeenCalled();
    // });
});
