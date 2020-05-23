const express = require('express');
const app = express();
const cors = require("cors");
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const chatBot = require('./chatbot');
app.use(cors());
io.on('connection', (socket) => initSocket(socket));

const botName = "Bucky"; // The name of our bot is Bucky, because he's a bucket.

let userCount = 1; // Arbitrary number.
let questionCount = 3444; // Arbitrary number.
let clients = {}; // This object holds all connected socket clients.
let questionBank = {}; // This object holds all questions with their ID as a key.
let answerBank = {}; // This object holds all given answers with their ID as a key.
let chatHistory = []; // This objcets holds an array of message IDs sorted by date.


initSocket = (socket) => {
    const userId = `User ${userCount.toString().padStart(4,'0')}`; // Assign a userID to new client
	socket.userId = userId;
	clients[userId] = socket;
	userCount++;
    socket.on('disconnect', () => delete clients[socket.userId]);
    socket.emit('userId',userId); // Let the client know what his user ID is.

    socket.on('question', (question) => {
        question.date = Date.now();
        processQuestion(question, userId);
    });

    socket.on('answer', (answer) => {
        answer.date = Date.now();
        processAnswer(answer, userId);
    });

    socket.on('typing', (typing) => {
        broadcast('typing', typing.userId); // Signal to everyone that somebody's typing
    });
}

function processQuestion(question, userId) {
    userId = userId ? userId : (question.userId ? question.userId : 'Unknown User');
    const questionId =  questionCount.toString().padStart('4', 0); // generate an ID for the question
    questionCount++; // Advance arbitrary counter by +1
    question.questionId = questionId; // Assign to object
    question.resolved = false; // Questions are unresolved by default
    questionBank[questionId] = question; // Add to question bank.
    addToChatHistory(question); // Add to chat history.
    broadcast(question.type, { author: userId, message: question.message, questionId: questionId });
    askBotForHelp(question);
}

function processAnswer(answer, userId, doNotMapKeywords = false) {
    userId = userId ? userId : (answer.userId ? answer.userId : 'Unknown User');
    const questionBeingAnswered = questionBank[answer.questionId];
    if (!questionBeingAnswered){
        console.error("Could not find question with id:", answer.questionId)
        return;
    }
    questionBank[answer.questionId].resolved = true;
    answerBank[answer.questionId] = answer;
    if (!doNotMapKeywords){
        chatBot.mapAnswerToKeywords(questionBank[answer.questionId].message, answer.questionId);
    }
    addToChatHistory(answer);
    broadcast(answer.type, { author: userId, message: answer.message, questionId: answer.questionId });
}

function askBotForHelp(question){
    const answerId = chatBot.findRelevantAnswerIdByKeywords(question);
    if (!answerId){
        return;
    }
    const answerText = answerBank[answerId].message.split(':')[1];
    answer = chatBot.generateAnswer(answerText, question.questionId, botName);
    setTimeout(() => broadcast('typing', botName), 500);
    const randomTime = 1000 * (Math.floor(Math.random() * 4) + 1); // Randomize number of seconds before Bucky answers.  
    setTimeout(() => processAnswer(answer, answer.author, true), randomTime);
}

function addToChatHistory(message){
    chatHistory.push({ type: message.type, id: message.questionId, date: message.date });
}

function broadcast(type, payload) {
    io.emit(type, payload);
}

app.get('/chatlog', (req, res) => {
    const payload = [];
    for (let message of chatHistory){
        if (message.type === 'question'){
            payload.push(questionBank[message.id]);
        }else{
            payload.push(answerBank[message.id]);
        }
    }
    res.send(payload);
});

initDemoChatHistory();
http.listen(3000);

function initDemoChatHistory(){
    // a "database" init script for the sake of this mockup.
    const stockMessages = [
        {
            type: 'question',
            author: 'Yossi',
            message: `Hi everyone, I'm just getting into chocolate bars for the first time. What is the recommended way to eat a Three Musketeers? Should I use my hands or a knife and fork?`,
            date: 1016820035000,
            resolved: true
        },
        {
            author: 'Bamba Baby',
            type: 'question',
            message: `I'm trying to open a bag of Cheetos but I keep dropping pieces everywhere! Also, it stains my fingers so I tried to devise a solution to eat them with chopsticks but they keep dropping and I don't know what I'm doing wrong.`,
            date: 1168610435000,
            // questionId: 3441,
            resolved: true
        },
        {
            author: "Topo Lapompo",
            type: 'answer',
            message: "@Question #3445: I don't understand the question. What are you trying to do, exactly? Actually, it doesn't matter. STOP EATING CHEETOS. They are an old outdated taste and you should eat Doritos as they are the currently accepted standard and your tech lead will thank you for it.",
            date: 1231768835000,
            questionId: '3445'
        },
        {
            author: botName,
            type: 'answer',
            message: "@Question #3444: Consuming Three Musketeers is deprecated. Eat a Milky Way instead, meatbag.",
            date: 1231768835021,//1105538435000,
            questionId: '3444'
        },
        {
            author: 'Charlie Emac',
            type: 'question',
            message: 'How do I exit Vim? is this even the right place to ask?',
            date: 1294840835000,
            resolved: true
        },
        {
            author: botName,
            type: 'answer',
            message: "@Question #3446: I'm marking this as a duplicate, and I am not going to link you to the original question. Send Google Search my regards, human.",
            date: 1421071235000,
            questionId: '3446'
        }
    ];
    for (let i = 0; i < stockMessages.length; i++){
        stockMessages[i].type === 'question' ? processQuestion(stockMessages[i]) : processAnswer(stockMessages[i]);
    }
    chatHistory = Object.keys(questionBank).map(key => ({ id: key, type: 'question', date: questionBank[key].date }));
    chatHistory.push(...Object.keys(answerBank).map(key => ({ id: key, type: 'answer', date: answerBank[key].date })));
    chatHistory = chatHistory.sort((a,b)=> a.date - b.date);
}