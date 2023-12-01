/* eslint-disable no-undef */
require('dotenv').config();

// const flash = require("connect-flash");
const http = require("http");
const path = require("path");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const { v2: cloudinary } = require("cloudinary");
const { cloudinaryConfig } = require("./config/config");

const { instrument } = require("@socket.io/admin-ui");
const { Server } = require("socket.io");

const { generateId } = require('./utils/utils');
const { corsConfig } = require('./config/config');
const { authConfig } = require('./config/config');
const { sessionConfig } = require('./config/config');
const { logRequestDetails } = require('./middlewares/access-log');

const logger = require('./config/logger');
const indexRouter = require("./routes/index-router");
const connectDb = require("./middlewares/db");
connectDb();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: corsConfig });

global._io = io;
global._users = {};
global._rooms = {};

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIES_SECRET));
app.use(express.static(path.join(__dirname, "public")));
// app.use(flash());
app.use(session(sessionConfig));

app.use(logRequestDetails);
app.use(indexRouter);

cloudinary.config(cloudinaryConfig);
async function uploadToCloudinary(file) {
    try {
        const result = await cloudinary.uploader.upload(file.data, {
            resource_type: 'auto',
            folder: 'call-mate',
        });
        logger.info(`🚀 result`, result);

        return {
            name: file.name,
            type: file.type,
            size: file.size,
            cloudinaryUrl: result.secure_url,
        };
    } catch (error) {
        logger.error('Error uploading file to Cloudinary:', error);
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            cloudinaryUrl: file.data,
        };
    }
}
io.on("connection", (socket) => {


    // webRTC handler
    socket.on('offer', (data) => {
        io.to(data.target).emit('offer', { target: socket.id, offer: data.offer });
    });
    socket.on('answer', (data) => {
        io.to(data.target).emit('answer', data.answer);
    });
    socket.on('ice-candidate', (data) => {
        io.to(data.target).emit('ice-candidate', data.candidate);
    });
    socket.on('ready-call', (roomId) => {
        console.log('ready to call');
        console.log(_rooms);
        socket.to(roomId).emit('ready-call');
    });
    socket.on('end-call', (remoteUserId) => {
        io.to(remoteUserId).emit('end-call');
    });
    // webRTC handler

    // chat handler
    socket.on('chat-message', (data) => {
        console.log(`🚀 🚀 file: app.js:134 🚀 socket.on 🚀 data`, data);
        socket.to(data.roomName).emit('chat-message', data);
    });
    // chat handler

    // room handler
    socket.on('createRoom', () => {
        console.log(`User createRoom`);
        let roomId = generateId();
        while (_rooms[roomId]) {
            roomId = generateId();
        }
        _rooms[roomId] = { members: [] };
        socket.emit('redirectToRoom', `/room/${roomId}`);
    });
    socket.on('join', (roomId) => {
        if (!_rooms[roomId]) {
            return socket.emit('room-not-found');
        }
        return socket.emit('redirectToRoom', `/room/${roomId}`);
    });
    socket.on('join-room', (roomId) => {
        console.log(`🚀 roomId`, roomId);
        console.log(`🚀 _rooms`, _rooms);
        if (!_rooms[roomId]) {
            return socket.emit('room-not-found');
        }
        if (_rooms[roomId].members.length < 2) {
            socket.join(roomId);
            socket.to(roomId).emit('new-user', {
                newUserId: socket.id,
                newUsername: _users[socket.id]
            });

            _rooms[roomId].members.push(socket.id);
            console.log(`🚀 ~ socket.on ~ _rooms:`, _rooms);

            socket.emit('all-users', _rooms[roomId].members);
        } else {
            socket.emit('room-full');
        }
    });
    // room handler

    // file handler
    socket.on('file', async (data) => {
        const { file, roomId } = data;
        const fileData = await uploadToCloudinary(file);
        socket.to(roomId).emit('file', {
            file: fileData,
            sender: _users[socket.id],
            isSender: false
        });
        socket.emit('file', {
            file: fileData,
            sender: _users[socket.id],
            isSender: true
        })
    });
    // file handler


    // other handler
    socket.on("set-username", (userName) => {
        if (_users[userName] && _users[socket.id]) {
            return;
        }
        _users[userName] = socket.id;
        _users[socket.id] = userName;
    });
    socket.on("connect_error", (err) => {
        logger.error(`connect_error due to `, err);
        logger.error(`connect_error due to ${err.message}`);
    });
    socket.on("disconnect", () => {
        const roomId = Object.keys(_rooms).find((roomId) =>
            _rooms[roomId].members.includes(socket.id)
        );
        if (roomId) {
            _rooms[roomId].members.splice(_rooms[roomId].members.indexOf(socket.id), 1);
            socket.broadcast.to(roomId).emit('user-disconnected', socket.id);
            socket.broadcast.to(roomId).emit('end-call');
        }
    });
    // other handler
});

// https://admin.socket.io/
instrument(io, {
    auth: authConfig,
    serverId: `${require("os").hostname()}#${process.pid}`
});

const PORT = process.env.PORT || 8080;
const IP = process.env.IP || '0.0.0.0';
server.listen(PORT, IP, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is running on ip ${IP}`);
});


