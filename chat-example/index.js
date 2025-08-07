const express = require('express');
const app = express(); 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const nicknames = {};
const users = {};

// 🔧 Added: track all open socket IDs per username (or guestName)
const userSockets = {};  

// 🔧 Added: helper to return a de-duplicated map of users by username
function getUniqueUsers() {
    const unique = {};
    const seen = new Set();
    for (const sockId in users) {
        const { name, avatar } = users[sockId];
        if (!seen.has(name)) {
            seen.add(name);
            unique[sockId] = { name, avatar };
        }
    }
    return unique;
}

const avatarImages = [
    '/avatars/img1.jpg',
    '/avatars/img2.jpg',
    '/avatars/img3.jpg',
    '/avatars/img4.jpg',
    '/avatars/img5.jpg',
    '/avatars/img6.jpg'
];
let guestCount = 1;
let userCount = 0;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
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

io.on('connection', (socket) => {
    const session = socket.request.session;
    const isLoggedIn = !!session.user;

    let guestName = `Guest${guestCount++}`;

    const nameKey = isLoggedIn ? session.user : guestName;

    if (!userSockets[nameKey]) {
      userSockets[nameKey] = new Set();
    }
    userSockets[nameKey].add(socket.id);

    nicknames[socket.id] = guestName;

    if (isLoggedIn) {
        console.log(`${session.user} connected!`);
        socket.nickname = session.user;
        users[socket.id] = {
            name: socket.nickname,
            avatar: getRandomAvatar()
        };

        socket.emit('nicknameButtonCreate');
        socket.emit('logoutButtonCreate');
        socket.emit('hideReg/Log');
        socket.emit('store nickname', session.user);
        socket.emit('existing users', getUniqueUsers());

        if (userSockets[nameKey].size === 1) {
          socket.broadcast.emit('username box add', {
            id: socket.id,
            name: session.user,
            avatar: users[socket.id].avatar
          });
        }
        userCount++;

    } else {
        console.log('Anon connected!');
        socket.nickname = guestName;
        users[socket.id] = {
            name: guestName,
            avatar: getRandomAvatar()
        };

        socket.emit('store nickname', guestName);

        socket.emit('existing users', getUniqueUsers());

        if (userSockets[nameKey].size === 1) {
          socket.broadcast.emit('username box add', {
            id: socket.id,
            name: guestName,
            avatar: users[socket.id].avatar
          });
        }
        userCount++;
    }

    io.emit('counter update', userCount);
    if (userSockets[nameKey].size === 1) {
        io.emit('user joined', socket.nickname);
    }

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
            });
        }
    });

    socket.on('removeNickname', () => {
        const session = socket.request.session;
        const isLoggedIn = !!session.user;

        if (!isLoggedIn) {
            socket.emit('nickname error', 'Guests can’t remove nicknames!');
            return;
        }

        // Reset nickname to default (e.g. Guest123 or session.user)
        const originalName = session.user;
        socket.nickname = originalName;
        nicknames[socket.id] = originalName;
        users[socket.id].name = originalName;

        // Notify the client
        socket.emit('nickname removed', originalName);

        io.emit('nickname updated logged', {
            id: socket.id,
            nicknameSent: originalName,
            loggedUser: originalName
        });

        console.log(`Nickname reset for ${socket.id} → ${originalName}`);
    });


    socket.on('nickname change', (name) => {
        const session = socket.request.session
        const isLoggedIn = !!session.user;

        let userTaken = false;
        for (let id in nicknames) {
            if (nicknames[id] == name) {
                userTaken = true;
                break;
            }
        }

        if (session.user && session.user == name) {
            userTaken = true;
        }

        if (!isLoggedIn) {
            socket.emit('nickname error', 'you have to be logged in to change your nickname!!')
            return;
        }

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
                });
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
        const disconnectKey = socket.nickname;
        if (userSockets[disconnectKey]) {
          userSockets[disconnectKey].delete(socket.id);
        }

        if (!userSockets[disconnectKey] || userSockets[disconnectKey].size === 0) {
            io.emit('user left', { id: socket.id, name: socket.nickname });
        }
        delete users[socket.id];

        if (!userSockets[disconnectKey] || userSockets[disconnectKey].size === 0) {
          delete userSockets[disconnectKey];
          io.emit('username box remove', { id: socket.id });
        }

        userCount--;
        io.emit('counter update', userCount);
        delete nicknames[socket.id];
        guestCount--;
        console.log(`${socket.nickname} disconnected`);
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});
