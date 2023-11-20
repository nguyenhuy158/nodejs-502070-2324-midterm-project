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

const indexRouter = require("./routes/index-router");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDb = require("./middlewares/db");
const { logRequestDetails } = require('./middlewares/access-log');
const session = require("express-session");
const MongoStore = require('connect-mongo');


const users = {};
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
    // milliseconds * seconds * minutes * hours * days
    // 1000 * 60 * 60 * 24 * 10 = 10 days
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 10 },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
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

    let userId = socket.id;
    users[socket.id] = socket.id;

    socket.on("set-username", (userName) => {

        const tempVal = users[userId];
        delete users[userId];
        userId = userName;
        users[userId] = tempVal;

        socket.broadcast.emit('new-active', Object.assign({}, { [userId]: socket.id }));

        const otherUser = Object.fromEntries(
            Object.entries(users).filter(([key, value]) => key !== userId && value !== userId)
        );
        socket.emit('active-list', otherUser);
    });

    socket.on("get-active-list", (roomName = '') => {
        try {
            console.log(`get-active-list: ${userId}`);
            const usersInRoom = getUsersInRoom(roomName);
            console.log(`usersInRoom`, usersInRoom);

            const objCopy = { ...usersInRoom };

            if (objCopy.hasOwnProperty(userId)) {
                delete objCopy[userId];
            }

            socket.emit("active-list", objCopy);
        } catch (error) {
            console.error(`Error in get-active-list: ${error}`);
            // You can also emit an error event to the client
            socket.emit("error", { message: 'An error occurred in get-active-list' });
        }
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
        // delete users[userId];
        // socket.broadcast.emit('remove-active', Object.assign({}, { [userId]: socket.id }));

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

    // Join a room
    socket.on('createRoom', (roomName) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
        // Redirect the user to the 'room-call.ejs' page
        socket.emit('redirectToRoom', `/room/${generateId()}`);
    });

    socket.on('join-room', (roomId) => {
        console.log(`🚀 rooms`, rooms);
        if (!rooms[roomId]) {
            rooms[roomId] = { members: [] };
        }
        if (rooms[roomId].members.length < 2) {
            socket.join(roomId);
            socket.to(roomId).emit('new-user', socket.id);

            rooms[roomId].members.push(socket.id);
            console.log(`🚀 ~ socket.on ~ rooms:`, rooms);

            // Gửi thông tin thành viên trong phòng cho client
            socket.emit('all-users', rooms[roomId].members);
        } else {
            // Redirect user to another page
            socket.emit('room-full');
        }
    // socket.join(room);
    // socket.to(room).emit('userJoined', socket.id);
    });

    function getUsersInRoom(room) {
        console.log(`🚀 🚀 file: app.js:168 🚀 getUsersInRoom 🚀 room`, room);
        console.log(`🚀 🚀 file: app.js:170 🚀 getUsersInRoom 🚀 io.sockets.adapter.rooms`, io.sockets.adapter.rooms);
        let socketsInRoom = io.sockets.adapter.rooms.get(room);
        console.log(`🚀 🚀 file: app.js:171 🚀 getUsersInRoom 🚀 socketsInRoom`, socketsInRoom);
        console.log(`🚀 🚀 file: app.js:173 🚀 getUsersInRoom 🚀 users`, users);
        if (!socketsInRoom) {
            return [];
        }

        socketsInRoom = Array.from(socketsInRoom);
        console.log(`🚀 🚀 file: app.js:178 🚀 getUsersInRoom 🚀 socketsInRoom`, socketsInRoom);
        console.log(`🚀 🚀 file: app.js:181 🚀 getUsersInRoom 🚀 users`, users);

        const filteredUsers = Object.fromEntries(
            Object.entries(users).filter(([key, value]) => {
                return socketsInRoom.includes(value);
            })
        );

        console.log(filteredUsers);

        return filteredUsers;
    }
});


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


