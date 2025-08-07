#  Real-Time Chat App XABCORD
## (obviously just a test)

---

## Features

- **Live Chat**: Real-time messaging using Socket.IO
- **Guest Access**: Join instantly as a guest with a random avatar
- **User Registration/Login**: Secure authentication with bcrypt and SQLite
- **Nickname System**: Change your nickname (if logged in)
- **Typing Indicators**: See when other users are typing
- **User Avatars**: Random avatars assigned to each user
- **Session Persistence**: Logged-in users retain identity across sockets
- **User Count & Notifications**: Live user counter and join/leave alerts

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Server-side runtime |
| **Express** | Web framework |
| **Socket.IO** | Real-time communication |
| **SQLite3** | Lightweight database |
| **bcrypt** | Password hashing |
| **HTML/CSS/JS** | Frontend |

---

## Authentication Flow

- Users register with a username and password.
- Passwords are hashed using bcrypt before storing in SQLite.
- Sessions are used to track logged-in users across socket connections.
- Guests are assigned a temporary nickname and avatar.

---

## Avatar System

Each user (guest or logged-in) gets a randomly selected avatar from the `/avatars` folder.

---

## Nickname Logic

- Guests get auto-generated nicknames like `Guest1`, `Guest2`, etc.
- Logged-in users can change their nickname (if it's not already taken).
- Nicknames are broadcast to all users and updated live.

---

## Form Validation

The registration form includes client-side validation:
- **Username**: Minimum 3 characters, no spaces
- **Password**: Minimum 5 characters, must include uppercase and number

---

Webpage is hosted on:
**http://localhost:3000**
if you wish to test it out with your friends, port foward port 3000.

 Notes
node_modules is excluded from version control via .gitignore

All dependencies are tracked in package.json

SQLite database file (chat.db) is stored locally

 Contributions
Feel free to fork, improve, or suggest features.
