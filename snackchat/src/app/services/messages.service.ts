import { Injectable } from '@angular/core';
import { ChatMessage, ChatMessageType } from '../models';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable()
export class MessagesService {
    private endpoint = 'http://localhost:3000';
    private socket;

    private _messages: ChatMessage[] = [];
    public get messages(): ChatMessage[] {
        return this._messages;
    }

    private _currentUser: string;
    public get currentUser(): string {
        return this._currentUser;
    }

    public $someoneIsTyping = new Subject<string>();
    public $updateChatLog = new Subject();

    constructor(private http: HttpClient){

    }

    public async initMessages(){
        const chatLog = await this.http.get<ChatMessage[]>(`${this.endpoint}/chatlog`).toPromise();
        if (chatLog){
            this._messages = chatLog;
        }
        return;
    }

    public addMessage(message: ChatMessage){
        this._messages.push(message);
    }

    public setCurrentUser(userId: string){
        this._currentUser = userId;
    }

    public initSocketForUser(){
        this.socket = io(this.endpoint, {transports: ['websocket']});

        this.socket.on(ChatMessageType.Question, (msg: ChatMessage) => {
            msg.type = ChatMessageType.Question;
            this.addMessage(msg);
            this.$updateChatLog.next();
        });

        this.socket.on(ChatMessageType.Answer, (msg: ChatMessage) => {
            msg.type = ChatMessageType.Answer;
            this.addMessage(msg);
            const chatMessage = this.findMessageByQuestionId(msg.questionId, ChatMessageType.Question);
            if (chatMessage){
                chatMessage.resolved = true;
            }
            this.$updateChatLog.next();
        });

        this.socket.on('userId', (userId: string) => {
            this.setCurrentUser(userId);
        });

        this.socket.on('typing', (typingUser) => {
            this.$someoneIsTyping.next(typingUser);
        });
    }

    public broadcastTypingEvent(){
        this.socket.emit('typing', { userId: this.currentUser})
    }

    public broadcastQuestion(text: string){
        this.socket.emit('question', {
            type: ChatMessageType.Question,
            message: text,
            author: this.currentUser
        });
    }

    public broadcastAnswer(text: string, questionId: string){
        this.socket.emit('answer', {
            type: ChatMessageType.Answer,
            message: text,
            questionId,
            author: this.currentUser
        });
    }

    public findMessageByQuestionId(id: string, type: string){
        if (!id){
            return;
        }
        const message = this.messages.find(msg => msg.questionId === id && msg.type === type);
        if (message){
            return message;
        }
        return undefined;
    }
}
