require('dotenv').config();

const flash = require("connect-flash");
const { instrument } = require("@socket.io/admin-ui");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io", "*:*"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

const indexRouter = require("./routes/indexRouter");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDb = require("./middlewares/db");
const { generateUserId } = require('./middlewares/utils');


const users = {};

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIES_SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());


connectDb();

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

    socket.on("get-active-list", () => {
        console.log(`get-active-list: ${userId}`);
        const objCopy = { ...users };

        if (objCopy.hasOwnProperty(userId)) {
            delete objCopy[userId];
        }

        socket.emit("active-list", objCopy);
    });

    socket.on("offer", (offer, targetUserName) => {
        console.log(`offer: ${userId} => ${targetUserName}`);
        const targetSocketId = users[targetUserName];

        console.log(`targetSocketId`, targetSocketId);
        console.log(`userId`, userId);

        if (targetSocketId) {
            socket.to(targetSocketId)
                .emit("offer", offer, userId);
        } else {
            socket.emit("user-not-found", targetUserName);
        }
    });

    socket.on("answer", (answer, targetUserId) => {
        console.log(`answer: ${userId} => ${targetUserId}`);
        const targetSocketId = users[targetUserId];

        console.log(`targetSocketId`, targetSocketId);
        console.log(`userId`, userId);

        if (targetSocketId) {
            socket.to(targetSocketId)
                .emit("answer", answer, userId);
        } else {
            socket.emit("user-not-found", targetUserId);
        }
    });

    socket.on("ice-candidate", (candidate, targetUserId) => {
        console.log(`ice-candidate: ${userId} => ${targetUserId}`);


        if (targetUserId !== null) {
            const targetSocketId = users[targetUserId];
            if (targetSocketId) {
                socket.to(targetSocketId)
                    .emit("ice-candidate", candidate, userId);
            } else {
                socket.emit("user-not-found", targetUserId);
            }
        }
    });

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to `, err);
        console.log(`connect_error due to ${err.message}`);
    });

    socket.on("disconnect", () => {
        delete users[userId];
        socket.broadcast.emit('remove-active', Object.assign({}, { [userId]: socket.id }));
    });

    socket.on('chat-message', (data) => {
        console.log(`🚀 🚀 file: app.js:134 🚀 socket.on 🚀 data`, data);
        socket.broadcast.emit('chat-message', data);
    });

    socket.on('end-call', (data) => {
        console.log(`🚀 🚀 file: app.js:134 🚀 socket.on 🚀 data`, data);
        const targetSocketId = users[data];
        if (targetSocketId) {
            socket.to(targetSocketId).emit('end-call', data);
        } else {
            socket.emit("user-not-found", data);
        }
    });
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


