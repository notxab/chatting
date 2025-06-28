🗨️ # Epic Chat

A real-time web chat app built with Node.js, Express, and Socket.IO. Users can send messages, change nicknames, and see when others join or leave the chat.


## Features
Real-time messaging with Socket.IO

Auto-assigned guest nicknames (e.g. Guest1, Guest2…)

Custom nickname support with validation

Join/leave notifications

Auto-scroll to latest messages


## Technologies Used*
Node.js

Express

Socket.IO

HTML/CSS/JavaScript (Vanilla)


## Installation
Clone the repository:

bash
git clone https://github.com/your-username/epic-chat.git
cd epic-chat
Install dependencies:

bash
npm install
Start the server:

bash
node index.js
Open your browser:

Visit http://localhost:3000


## How It Works
When a user connects, they are assigned a default nickname like Guest1, Guest2, etc.

Users can click the "change nickname!!" button to enter a new name.

The server checks if the nickname is already taken and responds accordingly.

Messages are broadcast to all users with the sender's nickname.

The chat auto-scrolls to the newest message.

Join/leave events are displayed in the chat log.


## Future Improvements
* Persistent nicknames with localStorage or database

* User list sidebar

* Typing indicators

* Emojis and message formatting

* Dark/light theme toggle
