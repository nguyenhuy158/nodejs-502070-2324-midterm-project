// Dependencies
const express           = require("express");
const app               = express();
const { v4: uuid }      = require("uuid");
const socketIO          = require("socket.io");
const http              = require("http");
const expressHTTPServer = http.createServer(app);
const io                = new socketIO.Server(expressHTTPServer);
const port              = 3000;


io.on("connection", (socket) => {
    
    // socket.on("joinRoom", (roomId) => {
    //     socket.join(roomId);
    //
    //     socket.to(roomId).emit("newJoining", )
    //
    // });
    // console.log("Socket io connected");
    console.log("Socket.io connected");
    
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        
        socket.to(roomId)
              .emit("newJoining", socket.id);
        
        socket.on("offer", (offer) => {
            socket.to(roomId)
                  .emit("offer", socket.id, offer);
        });
        
        socket.on("answer", (peerId, answer) => {
            io.to(peerId)
              .emit("answer", socket.id, answer);
        });
        
        socket.on("ice-candidate", (peerId, candidate) => {
            io.to(peerId)
              .emit("ice-candidate", socket.id, candidate);
        });
        
        socket.on("disconnect", () => {
            socket.to(roomId)
                  .emit("userDisconnected", socket.id);
        });
    });
});

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    // res.sendFile(__dirname + "/views/pages/index.ejs");
    res.redirect(`/${uuid()}`);
});

app.get("/:roomId", (req, res) => {
    const roomId = req.params.roomId;
    res.render("pages/index", {
        roomId
    });
});

expressHTTPServer.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

