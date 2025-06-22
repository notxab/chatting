// http://localhost:3000

const express = require('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//initializes app to be a function handler to be supplied in a http server


app.get('/', (req, res) => { // '/' becomes route handler
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('message: ' + msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});






server.listen(3000, () => { // server listens on port 3000!!!
    console.log('listening on *:3000');
});