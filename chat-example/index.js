// http://localhost:3000

const express = require('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const nicknames = {};
const users = {};
const avatarImages = [
    '/avatars/img1.jpg',
    '/avatars/img2.jpg',
    '/avatars/img3.jpg',
    '/avatars/img4.jpg',
    '/avatars/img5.jpg',
    '/avatars/img6.jpg'
]
let guestCount = 1;
let userCount = 0;
//initializes app to be a function handler to be supplied in a http server


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => { // '/' becomes route handler
    res.sendFile(__dirname + '/index.html');
});

function getRandomAvatar() {
    const index = Math.floor(Math.random() * avatarImages.length);
    return avatarImages[index];
}


io.on('connection', (socket)=>{
    let guestName = `Guest${guestCount++}`;
    socket.nickname = guestName;
    nicknames[socket.id] = guestName;
    users[socket.id] = {
        name: guestName,
        avatar: getRandomAvatar()
    };

    socket.emit('store nickname', guestName);
    socket.emit('existing users', users);
    socket.broadcast.emit('username box add', {
        id: socket.id,
        name: socket.nickname,
        avatar: users[socket.id].avatar

    });

    userCount++;
    console.log('a user connected');

    io.emit('counter update', userCount);
    io.emit('user joined');

    socket.on('nickname change', (name) => {
        socket.nickname = name;

        let userTaken = false;
        for (let id in nicknames) {
            if (nicknames[id] == name) {
                userTaken = true;
                break;
            };
        };

        if (userTaken) {
            socket.emit('nickname error', 'nickname already taken!');
        } else {
            socket.nickname = name;
            nicknames[socket.id] = name;
            users[socket.id] = {
                name,
                avatar: users[socket.id].avatar
            };

            socket.emit('nickname change');
            socket.emit('store nickname', name);

            
            io.emit('nickname updated', {
                id: socket.id,
                newName: socket.nickname
            })

            console.log(guestName);
        };

    });

    socket.on('isTyping', (nickname) => {
        io.emit('GLOBALIsTyping', {
            id: socket.id,
            nickname: socket.nickname
        });
        
        socket.broadcast.emit('userTyping', {
            id: socket.id,
            nickname: socket.nickname
        });
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', `${socket.nickname}: ` + msg);
        console.log(`${socket.nickname}: ` + msg);
    });

    socket.on('disconnect', () => {
        io.emit('user left', {id: socket.id, name: socket.nickname});
        delete users[socket.id];
        io.emit('username box remove', {id:socket.id});

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