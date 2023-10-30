const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const app        = express();
const server     = http.createServer(app);
const io         = new Server(server);

const users = {}; // Store user socket IDs

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res, next) => {
    res.render("index");
});

io.on("connection", (socket) => {
    
    // Generate a unique user ID
    let userId;
    // console.log(`${userId} user connected`);
    // users[userId] = socket.id;
    console.log("=>users", users);
    
    socket.on("set-username", (userName) => {
        // Here, we associate the user's name with their socket ID
        userId          = userName;
        users[userName] = socket.id;
        console.log(`${userName} user connected`);
        console.log("=>users", users);
        socket.emit("your-name", userName); // Send the generated user name to the client
    });
    
    // socket.emit("your-id", userId); // Send the generated user ID to the client
    
    socket.on("offer", (offer, targetUserName) => {
        console.log(`offer: ${userId} => ${targetUserName}`);
        // Find the target user's socket ID
        const targetSocketId = users[targetUserName];
        if (targetSocketId) {
            // Send the offer to the target user
            io.to(targetSocketId)
              .emit("offer", offer, targetUserName);
        } else {
            // Handle the case where the target user is not found
            socket.emit("user-not-found", targetUserName);
        }
    });
    
    socket.on("answer", (answer, targetUserName) => {
        console.log(`answer: ${userId} => ${targetUserName}`);
        
        
        // Find the target user's socket ID
        const targetSocketId = users[targetUserName];
        if (targetSocketId) {
            // Send the answer to the target user
            io.to(targetSocketId)
              .emit("answer", answer, targetUserName);
        } else {
            // Handle the case where the target user is not found
            socket.emit("user-not-found", targetUserName);
        }
    });
    
    socket.on("ice-candidate", (candidate, targetUserName) => {
        console.log(`ice-candidate: ${userId} => ${targetUserName}`);
        
        // Find the target user's socket ID
        const targetSocketId = users[targetUserName];
        if (targetSocketId) {
            // Send the ICE candidate to the target user
            io.to(targetSocketId)
              .emit("ice-candidate", candidate, targetUserName);
        } else {
            // Handle the case where the target user is not found
            socket.emit("user-not-found", targetUserName);
        }
    });
    
    
    // Handle other events as needed
    socket.on("disconnect", () => {
        console.log(`${userId} user disconnected`);
        console.log("=>users", users);
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
