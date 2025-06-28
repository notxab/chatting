// http://localhost:3000

const express = require('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const nicknames = {};
let guestCount = 1;
//initializes app to be a function handler to be supplied in a http server


app.get('/', (req, res) => { // '/' becomes route handler
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
    let guestName = `Guest${guestCount++}`;
    console.log('a user connected');
    nicknames[socket.id] = guestName;


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
            nicknames[socket.id] = msg;
            console.log(guestName);
        }

    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', `${guestName}: ` + msg);
        console.log(`${guestName}: ` + msg);
    });

    socket.on('disconnect', () => {
        io.emit('user left');
        delete nicknames[socket.id];
        guestCount--;
        console.log('user disconnected');
    });

});







server.listen(3000, () => { // server listens on port 3000!!!
    console.log('listening on *:3000');
});