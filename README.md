# Epic Chat
A real-time web chat application built with Node.js, Express, and Socket.IO. Users can send live messages, choose custom nicknames, and see who’s joining or leaving the chat — all in an intuitive interface.


## Features
Real-time messaging via Socket.IO

Auto-assigned guest nicknames (e.g. Guest1, Guest2)

Custom nickname support with validation

Join/leave notifications

Auto-scroll to latest messages

Live user list and typing indicators


## Technologies Used
Node.js

Express

Socket.IO

HTML / CSS / JavaScript (Vanilla)


## Installation
bash
git clone https://github.com/your-username/epic-chat.git
cd epic-chat
npm install
node index.js
Then open your browser and go to: http://localhost:3000


## How It Works
When users connect, they’re given a default nickname like Guest1.

Clicking the “change nickname!!” button allows users to set a new one.

The server validates the nickname and avoids duplicates.

Messages are broadcast with each user's nickname.

Events like joins and leaves appear in the chat log.

A sidebar lists current users and shows when someone is typing.


## Future Improvements
Persistent nicknames using localStorage or a database

Custom avatars or profile colors

Emojis and message formatting

Dark/light theme toggle

Support for private chats or multiple rooms

Message history and export features
