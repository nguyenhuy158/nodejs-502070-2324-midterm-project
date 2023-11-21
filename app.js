/* eslint-disable no-undef */
require('dotenv').config();

const flash = require("connect-flash");
const { instrument } = require("@socket.io/admin-ui");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { generateId } = require('./utils/utils');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io", "*:*"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
global._io = io;

const indexRouter = require("./routes/index-router");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDb = require("./middlewares/db");
const { logRequestDetails } = require('./middlewares/access-log');
const session = require("express-session");
const MongoStore = require('connect-mongo');


global._users = {};
const rooms = {};

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(logger("dev"));
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIES_SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 10 },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 1000 * 60 * 60 * 24 * 10
    }),
    resave: true,
    saveUninitialized: true,
    name: 'callmate.sid',
    httpOnly: true,
    secure: true,
}));


connectDb();
app.use(logRequestDetails);
app.use(indexRouter);



io.on("connection", (socket) => {

    // const requestHeaders = socket.handshake.headers;
    // console.log(`🚀 🚀 file: app.js:40 🚀 io.on 🚀 requestHeaders`, requestHeaders);
    // console.log(`🚀 🚀 file: app.js:42 🚀 io.on 🚀 requestHeaders.host`, requestHeaders.host);

    socket.on("set-username", (userName) => {
        if (_users[userName] && _users[socket.id]) {
            return;
        }
        _users[userName] = socket.id;
        _users[socket.id] = userName;
    });

    socket.on('offer', (data) => {
        io.to(data.target).emit('offer', { target: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
        io.to(data.target).emit('answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.target).emit('ice-candidate', data.candidate);
    });

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to `, err);
        console.log(`connect_error due to ${err.message}`);
    });

    socket.on("disconnect", () => {
        // Xóa thông tin người dùng khi ngắt kết nối
        const roomId = Object.keys(rooms).find((roomId) =>
            rooms[roomId].members.includes(socket.id)
        );
        if (roomId) {
            rooms[roomId].members.splice(rooms[roomId].members.indexOf(socket.id), 1);
            socket.broadcast.to(roomId).emit('user-disconnected', socket.id);
            socket.broadcast.to(roomId).emit('end-call');
        }
    });

    socket.on('chat-message', (data) => {
        console.log(`🚀 🚀 file: app.js:134 🚀 socket.on 🚀 data`, data);
        socket.to(data.roomName).emit('chat-message', data);
    });

    socket.on('end-call', (remoteUserId) => {
        io.to(remoteUserId).emit('end-call');
    });

    socket.on('ready-call', (roomId) => {
        console.log('ready to call');
        console.log(rooms);
        socket.to(roomId).emit('ready-call');
    });

    socket.on('createRoom', () => {
        console.log(`User createRoom`);
        let roomId = generateId();
        while (rooms[roomId]) {
            roomId = generateId();
        }
        rooms[roomId] = { members: [] };
        socket.emit('redirectToRoom', `/room/${roomId}`);
    });

    socket.on('join', (roomId) => {
        if (!rooms[roomId]) {
            return socket.emit('room-not-found');
        }
        return socket.emit('redirectToRoom', `/room/${roomId}`);
    });

    socket.on('join-room', (roomId) => {
        console.log(`🚀 roomId`, roomId);
        console.log(`🚀 rooms`, rooms);
        if (!rooms[roomId]) {
            return socket.emit('room-not-found');
        }
        if (rooms[roomId].members.length < 2) {
            socket.join(roomId);
            socket.to(roomId).emit('new-user', {
                newUserId: socket.id,
                newUsername: _users[socket.id]
            });

            rooms[roomId].members.push(socket.id);
            console.log(`🚀 ~ socket.on ~ rooms:`, rooms);

            // Gửi thông tin thành viên trong phòng cho client
            socket.emit('all-users', rooms[roomId].members);
        } else {
            // Redirect user to another page
            socket.emit('room-full');
        }
    });

});

// admin.socket.io
instrument(io, {
    auth: {
        type: "basic",
        username: "admin",
        password: "$2a$10$Zek90ZcKamw4C3XW6Y28KuLxdyFcywscn2o7KWBO3T0Za.oWORs.6"
    },
    serverId: `${require("os").hostname()}#${process.pid}`
});

const PORT = process.env.PORT || 8080;
const IP = process.env.IP || '0.0.0.0';
server.listen(PORT, IP, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is running on ip ${IP}`);
});


