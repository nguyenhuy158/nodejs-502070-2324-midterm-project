require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = {};

io.on("connection", (socket) => {
    socket.on("new-user", (userId) => {
        users[userId] = socket;
        console.log("=>(app.js:15)  ",  );
        console.log("=>(app.js:15) users[userId]", users[userId]);
    });
    
    socket.on("disconnect", () => {
        // Handle user disconnection
        console.log("=>(app.js:20) disconnect", "");
    });
    
    socket.on("message", (message, targetUserId) => {
        const targetUser = users[targetUserId];
        if (targetUser) {
            targetUser.emit("message", message);
        }
    });
});


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
