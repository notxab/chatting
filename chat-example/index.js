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

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => { // '/' becomes route handler
    res.sendFile(__dirname + '/views' + '/index.html');
});

const sessionMiddleware = require('./config/sessionConfig');
app.use(sessionMiddleware);

const authRoutes = require('./routes/auth');
app.use(authRoutes);

function getRandomAvatar() {
    const index = Math.floor(Math.random() * avatarImages.length);
    return avatarImages[index];
}



// wires up with authController.js
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});


io.on('connection', (socket)=>{
    const session = socket.request.session;
    const isLoggedIn = !!session.user;

    let guestName = `Guest${guestCount++}`;
    nicknames[socket.id] = guestName;
    

    if (isLoggedIn) {
        console.log(`${session.user} connected!`)
        socket.nickname = session.user;
        users[socket.id] = {
            name: socket.nickname,
            avatar: getRandomAvatar()
        };

        socket.emit('logoutButtonCreate');
        socket.emit('hideReg/Log');
        socket.emit('store nickname', `${session.user}`);
        socket.emit('existing users', users);

        socket.broadcast.emit('username box add', {
        id: socket.id,
        name: session.user,
        avatar: users[socket.id].avatar
        

    });
        userCount++;

    } else  { // if user is not logged in, he'll be displayed as a guest!
        console.log('Anon connected!')
        
        users[socket.id] = {
            name: guestName,
            avatar: getRandomAvatar()
        };
        
        socket.nickname = guestName;

        socket.emit('store nickname', guestName);
        socket.emit('existing users', users);

        socket.broadcast.emit('username box add', {
        id: socket.id,
        name: socket.nickname,
        avatar: users[socket.id].avatar
        

    });
        userCount++;

    }

    




    io.emit('counter update', userCount);
    io.emit('user joined', socket.nickname);



    // plays notification sfx
    socket.on('newMessage', () => {
        io.emit('notificationSFX');
    });


    socket.on('logoutUser', () => {
        const session = socket.request.session;
        if (session) {
            socket.emit('loggedOut');
            session.destroy(err => {
                if (err) {
                    console.error('socket error', err);
                    socket.disconnect();
                }
            })
        }

    });


    socket.on('nickname change', (name) => {

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

            if (isLoggedIn) {

            socket.nickname = name;
            nicknames[socket.id] = name;
            users[socket.id] = {
                name,
                avatar: users[socket.id].avatar
            };

            socket.emit('nickname change');
            socket.emit('store nickname', name);

            
            io.emit('nickname updated logged', {
                id: socket.id,
                nicknameSent: socket.nickname,
                loggedUser: session.user
            })

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
            });

            }
        }
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
        console.log(`${socket.nickname} (${session.user}): ` + msg);
    });

    socket.on('disconnect', () => {
        io.emit('user left', {id: socket.id, name: socket.nickname});
        delete users[socket.id];
        io.emit('username box remove', {id:socket.id});

        userCount--;
        io.emit('counter update', userCount);
        delete nicknames[socket.id];
        guestCount--;
        console.log(`${socket.nickname} disconnected`);
    });

});







server.listen(3000, '0.0.0.0', () => { // server listens on port 3000!!!
    console.log('listening on *:3000');
});