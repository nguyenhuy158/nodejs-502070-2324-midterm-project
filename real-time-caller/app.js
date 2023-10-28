const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // Store user socket IDs

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res, next) => {
    res.render("index");
});

io.on("connection", (socket) => {

    // Generate a unique user ID
    let userId = generateUserId();
    console.log(`${userId} user connected`);
    users[userId] = socket.id;
    console.log("=>users", users);

    socket.emit("your-id", userId); // Send the generated user ID to the client

    socket.on("set-username", (userName) => {
        // Here, we associate the user's name with their socket ID
        const tempVal = users[userId];
        delete users[userId];
        userId          = userName;
        users[userId] = tempVal;
        console.log(`${userName} user connected`);
        console.log("=>users", users);
        socket.emit("your-name", userName); // Send the generated user name to the client
    });

    socket.on("offer", (offer, targetUserId) => {
        console.log(`offer: ${userId} => ${targetUserId}`);
        // Find the target user's socket ID
        const targetSocketId = users[targetUserId];
        if (targetSocketId) {
            // Send the offer to the target user
            io.to(targetSocketId)
                .emit("offer", offer, userId);
        } else {
            // Handle the case where the target user is not found
            socket.emit("user-not-found", targetUserId);
        }
    });

    socket.on("answer", (answer, targetUserId) => {
        console.log(`answer: ${userId} => ${targetUserId}`);

        // Find the target user's socket ID
        const targetSocketId = users[targetUserId];
        if (targetSocketId) {
            // Send the answer to the target user
            io.to(targetSocketId)
                .emit("answer", answer, userId);
        } else {
            // Handle the case where the target user is not found
            socket.emit("user-not-found", targetUserId);
        }
    });

    socket.on("ice-candidate", (candidate, targetUserId) => {
        console.log(`ice-candidate: ${userId} => ${targetUserId}`);


        if (targetUserId !== null) {
            // Find the target user's socket ID
            const targetSocketId = users[targetUserId];
            if (targetSocketId) {
                // Send the ICE candidate to the target user
                io.to(targetSocketId).emit("ice-candidate", candidate, userId);
            } else {
                // Handle the case where the target user is not found
                socket.emit("user-not-found", targetUserId);
            }
        }
    });

    // Handle other events as needed

    socket.on("disconnect", () => {
        console.log(`${userId} user disconnected`);
        // Remove the user from the users object when they disconnect
        delete users[userId];
    });
});

function generateUserId() {
    return Math.random()
        .toString(36)
        .substr(2, 9); // Generate a random ID
}

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
