export enum ChatMessageType {
    Question = 'question',
    Answer = 'answer'
}

export interface ChatMessage {
    author: string;
    message: string;
    type: ChatMessageType;
    questionId?: string;
    resolved?: boolean;
    highlight?: boolean; // Client only
}
