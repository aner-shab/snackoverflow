# Snack Overflow
Snack Overflow is a chatroom where snack consumers and enthusiasts can ask about their favorite snacks. It is hosted by Bucky, a mysterious AI that takes the form of a rusting bucket. It's not very smart.

Users can ask questions, and answer any unresolved ones in turn. Bucky will always attempt to answer about snacks he's heard of before, even if his answer is completely and utterly useless.

## Running the app
You can run the app by running start.sh. Make sure you have node.js installed.

## Bucky
It's not really an AI. I didn't have a lot of time left to handle that aspect, so the chatbot basically collects any brand it recognizes and repeats the last answer where it was mentioned. Brands are derived from a static list and must begin with an uppercase letter (e.g. "Doritos" and not "doritos").

## Controls
In the app, you may:
* Chat with whoever is connected (or with yourself -- open two windows).
* Type in a question in the input field.
* Click a given answer to jump to its matching question, and vice versa.
* Answer unresolved questions by pressing the "Answer this Question" button on their bubble.
