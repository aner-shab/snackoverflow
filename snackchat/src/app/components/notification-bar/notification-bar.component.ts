import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagesService } from 'src/app/services/messages.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-notification-bar',
    templateUrl: './notification-bar.component.html',
    styleUrls: ['./notification-bar.component.scss']
})

export class NotificationBarComponent implements OnInit, OnDestroy {
    someoneIsTyping = undefined;
    private subscriptions: Subscription[] = [];

    constructor(public messagesService: MessagesService){
    }

    ngOnInit() {
        this.subscriptions.push(
            this.messagesService.$someoneIsTyping.subscribe((userId) => this.onSomeoneIsTyping(userId))
        );
    }

    ngOnDestroy(){
        this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe);
    }

    onSomeoneIsTyping(userId: string){
        if (userId === this.messagesService.currentUser){
            return;
        }
        if (!this.someoneIsTyping) {
            this.someoneIsTyping = userId;
        }
        setTimeout(() => this.someoneIsTyping = undefined, 3000);
    }
}