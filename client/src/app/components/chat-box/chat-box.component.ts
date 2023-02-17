import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { RoomService } from '@app/services/room-service/room.service';
import { VisualPlacementService } from '@app/services/visual-placement-service/visual-placement.service';
import { Chat, ChatAuthor } from '@common/chat/chat';
import { TICK_I } from '@common/constants/constants';
import { Objective, ObjectiveType } from '@common/objective/objective';
import { Player } from '@common/player/player';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit, OnDestroy {
    @ViewChild('scrollMe') myScrollContainer: ElementRef;
    @ViewChild('clearMe') myClearingContainer: ElementRef;
    player: Player;
    hostName: string;
    chatHistory: Chat[];

    constructor(public localGame: LocalGameHandlerService, public roomService: RoomService, public visualPlacementService: VisualPlacementService) {
        this.chatHistory = this.localGame.chatHistory;
        this.hostName = environment.socketUrl;
        const initialObjective: Objective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.player = {
            tray: [],
            name: '',
            score: 0,
            socketId: '',
            roomId: -1,
            gameType: 0,
            debugOn: false,
            chatHistory: [],
            privateOvjective: initialObjective,
        };
        this.roomService.getChatObservable().subscribe(() => {
            this.scrollToBottom();
            this.removeWrongPlacement();
        });
    }

    @HostListener('click')
    clickInsideTray() {
        this.visualPlacementService.cancelPlacement();
    }

    ngOnInit() {
        this.scrollToBottom();
    }

    ngOnDestroy() {
        this.roomService
            .getChatObservable()
            .subscribe(() => {
                this.scrollToBottom();
                this.removeWrongPlacement();
            })
            .unsubscribe();
    }

    removeWrongPlacement() {
        setTimeout(() => {
            if (
                this.chatHistory.length > 1 &&
                this.localGame.chatHistory[this.localGame.chatHistory.length - 1].message === 'Commande Impossible effacer apres 3 secondes'
            ) {
                this.roomService.socket.emit('update turn');
                this.localGame.chatHistory[this.localGame.chatHistory.length - 1].message = 'Commande Impossible';
            }
        }, TICK_I);
    }

    scrollToBottom(): void {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }

    onKeyup(event: Event): void {
        const eventValue = (event.target as HTMLInputElement).value;
        const isMessageNotEmpty = !eventValue || !eventValue.replace(/\s/g, '');
        if (isMessageNotEmpty) return;
        this.roomService.sendMessage(eventValue);
        this.myClearingContainer.nativeElement.value = '';
    }
    // Source: https://www.codegrepper.com/code-examples/javascript/overflow+auto+scroll+to+bottom
    // ViewChild Source: https://stackoverflow.com/questions/35232731/angular-2-scroll-to-bottom-chat-style

    addChat(chat: Chat): void {
        this.chatHistory.push(chat);
    }

    addMessage(message: string): void {
        this.addChat({ message, author: ChatAuthor.System });
    }
}
