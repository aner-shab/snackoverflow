import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { ChatMessage, ChatMessageType } from './models';
import { MessagesService } from './services/messages.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('chatbox') private chatScrollerElem: ElementRef;
  @ViewChild('inputField') private inputFieldElem: ElementRef;
  textInput: string;
  typingDebounce = new Subject();
  private subscriptions: Subscription[] = [];

  constructor(public messagesService: MessagesService){
  }

  async ngOnInit(){
    this.subscriptions.push(
      this.typingDebounce.pipe(auditTime(500)).subscribe(() => this.messagesService.broadcastTypingEvent()),
      this.messagesService.$updateChatLog.subscribe(()=> this.scrollToBottom())
    );

    this.messagesService.initSocketForUser();
    await this.messagesService.initMessages();
    this.scrollToBottom();
  }

  ngOnDestroy(){
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe);
  }

  onKeyDown(event: KeyboardEvent){
    if (event.key === 'Enter'){
      this.onMessageSent();
    }
  }

  onKeyUp(){
    this.typingDebounce.next();
  }

  onMessageSent(){
    if (this.textInput.length <= 0){
      return;
    }
    if (this.textInput.includes('@Question #')){
      const regex = new RegExp(`[^#]+(?=:)`, 'g');
      const regexMatches = this.textInput.match(regex);
      if (regexMatches && regexMatches[0]){
        const questionId = regexMatches[0];
        this.messagesService.broadcastAnswer(this.textInput, questionId);
      }
    }else{
      this.messagesService.broadcastQuestion(this.textInput);
    }
    this.textInput = '';
  }

  onAnswerQuestion(questionId: string){
    this.textInput = `@Question #${questionId}: `;
    this.inputFieldElem.nativeElement.focus();
  }

  scrollToBottom() {
    setTimeout(() => this.chatScrollerElem.nativeElement.scrollTop = this.chatScrollerElem.nativeElement.scrollHeight);
  }
}
