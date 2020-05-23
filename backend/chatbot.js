const snackMentions = require('./snacks').snackMentions;

function findSnackKeywords(message){
    const regExp = /=*([A-Z]\w*\W*)=*/g; // Look for words starting with Uppercase letters
    let keywords = message.match(regExp);
    if (!keywords){
        return null;
    }
    const removePunctuations = /[[\.,!?]+/g; // Remove all occurences of , ! . and ?
    keywords = keywords.map(word => {
        word = word.trim();
        word = word .replace(removePunctuations,'');
        if (word.length >= 3) { 
            return word.toLowerCase();
        }
    }).filter(word => word !== undefined);
    return keywords;
}


module.exports.mapAnswerToKeywords = (question, questionId) => {
    const keywords = findSnackKeywords(question);
    if (!keywords){
        return;
    }
    for (let keyword of keywords){
        if (snackMentions[keyword]){
            snackMentions[keyword] = questionId;
        }
    }
}

module.exports.findRelevantAnswerIdByKeywords = (question) => {
    const keywords = findSnackKeywords(question.message);
    if (!keywords){
        return null;
    }
    let possibleAnswers = [];
    for (let keyword of keywords){
        if (snackMentions[keyword] && snackMentions[keyword].length > 0){
            possibleAnswers.push(snackMentions[keyword]);
        }
    }
    if (possibleAnswers.length < 1){
        return null;
    }
    const chosenAnswerId = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
    return chosenAnswerId;
}

module.exports.generateAnswer = (answerText, questionId, botName) => {
    answerIntro = intros[Math.floor(Math.random() * intros.length)];
    answerInsult = insults[Math.floor(Math.random() * insults.length)];
    answerText = `@Question #${questionId}: ${answerIntro} ${answerInsult}. ${answerText}`;
    const answer = {
        author: botName,
        date: Date.now(),
        type: "answer",
        questionId: questionId,
        message: answerText
    }
    return answer;
}

const intros = [
    "Listen closely,",
    "Somebody's already asked this,",
    "Pffft,",
    "Such a silly question,",
    "It's very simple,",
    "Embarassing question,",
    "Sometimes I wonder why you even bother,",
    "Beep, boop,",
    "Seriously,"
];

const insults = [
    "meatbag",
    "human",
    "you sack of flesh",
    "fleshwad",
    "primate",
    "you primitive organism",
    "bonehead"
];