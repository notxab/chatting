// http://localhost:3000

const express = require('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const nicknames = {};
let guestCount = 1;
let userCount = 0;
//initializes app to be a function handler to be supplied in a http server


app.get('/', (req, res) => { // '/' becomes route handler
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
    let guestName = `Guest${guestCount++}`;
    socket.emit('store nickname', guestName);
    userCount++;
    console.log('a user connected');
    nicknames[socket.id] = guestName;


    io.emit('counter update', userCount);
    io.emit('user joined');

    socket.on('nickname change', (msg) => {
        let userTaken = false;
        for (let id in nicknames) {
            if (nicknames[id] == msg) {
                userTaken = true;
                break;
            }
        }

        if (userTaken) {
            socket.emit('nickname error', 'nickname already taken!');
        } else {
            socket.emit('nickname change');
            guestName = msg;
            socket.emit('store nickname', guestName);
            nicknames[socket.id] = msg;
            console.log(guestName);
        };

    });

    socket.on('isTyping', (nickname) => {
        socket.broadcast.emit('userTyping', `${nickname} is typing...`);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', `${guestName}: ` + msg);
        console.log(`${guestName}: ` + msg);
    });

    socket.on('disconnect', () => {
        io.emit('user left');
        userCount--;
        io.emit('counter update', userCount);
        delete nicknames[socket.id];
        guestCount--;
        console.log('user disconnected');
    });

});







server.listen(3000, '0.0.0.0', () => { // server listens on port 3000!!!
    console.log('listening on *:3000');
});