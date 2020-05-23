import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChatMessageType, ChatMessage } from 'src/app/models';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
    selector: 'app-chat-bubble',
    templateUrl: './chat-bubble.component.html',
    styleUrls: ['./chat-bubble.component.scss']
})

export class ChatBubbleComponent implements OnInit {
    @Input() msg: ChatMessage;
    @Output() answerQuestion = new EventEmitter();
    currentUser: string;

    constructor(private messagesService: MessagesService){
    }

    ngOnInit(){
        this.currentUser = this.messagesService.currentUser;
    }

    onResolvedMessageClicked(msg: ChatMessage){
        if (msg.type === ChatMessageType.Answer || msg.resolved){
            const inverseType = msg.type === ChatMessageType.Answer ? ChatMessageType.Question : ChatMessageType.Answer;
            const message = this.messagesService.findMessageByQuestionId(msg.questionId, inverseType);
            const elem = document.getElementById(inverseType + msg.questionId);
            elem.scrollIntoView({behavior: 'smooth'});
            message.highlight = true;
            setTimeout(() => { message.highlight = false; }, 1000);
        }
    }

    onAnswerQuestionClicked(questionId: string){
        this.answerQuestion.emit(questionId);
        // this.textInput = `@Question #${questionId}: `; // EE
        // this.inputField.nativeElement.focus();
    }
}
