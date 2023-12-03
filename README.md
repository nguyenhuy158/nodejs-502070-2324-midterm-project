# CallQuick Project [nodejs-502070-2324-middle-project]

Project: Real-time caller using WebRTC [Projects](https://drive.google.com/file/d/15Jn0WJvZvjyFAVr_qeT0fVKYVj8L6Eqs/view)

Website: [[https://callquick.onrender.com](https://callquick.onrender.com)](https://callmate.onrender.com/)

**Warning:** The first-time access may take longer to respond because the server auto-freezes the app when there are no end-users accessing the website.

## Pre-requisites

1. Node.js version 18.18.0 is required. You can download it from [Node.js Official Website](https://nodejs.org/en/).

2. Yarn version 1.22.19 is required. You can install it using the following command:

    ```bash
    npm install -g yarn
    ```

# Getting Started

1. Clone the repository:
    ```bash
    git clone https://github.com/nguyenhuy158/nodejs-502070-2324-midterm-project
    ```
2. Change to the project directory:
    ```bash
    cd nodejs-502070-2324-midterm-project/
    ```
3. Install project dependencies:
    ```bash
    yarn
    ```
4. Build and run the project:
    ```bash
    yarn dev
    ```
5. Open a web browser and navigate to http://localhost:8080 to access the local development version of the website.

# Deployment

To deploy your changes to the server (onrender.com):

1. Make code changes in the `real-time-caller` folder.

2. Push your code to the `main` branch, and the server onrender.com will automatically deploy the updated code.

3. Access the deployed website at https://callquick.onrender.com.

# Database Configuration

Configure your MongoDB database connection in the .env file:

```env
DB_URI=mongodb+srv://noreplaynodejs502070:9bmdioNxz8UeylCQ@techhutgc.foofgxp.mongodb.net/ChitChatConnect
```

Please note that the project currently lacks a sign-in/sign-up functionality.

# Deployment Account

Information on deployment can be found at https://render.com/.

Manage your deployed applications at https://dashboard.render.com/.

Login with the following account credentials:

-   Username: `noreplay.nodejs.502070@gmail.com`
-   Password: `noreplay.nodejs.502070`

# User Guide

Use the application to make real-time calls using WebRTC.

-   Open a browser and go to https://callquick.onrender.com, allow access to your camera and audio, enter your name in the input field, and click 'Submit Name.'
-   Open another browser or an incognito tab and access the same link, then follow the same steps.
-   In one of the two windows, click the "Reload List" button to fetch the list of active users.
-   To initiate a call, click the "Start Call" button, enter the name of the person you want to call, and click "OK."
-   The call will be automatically established, and both parties will be able to see and hear each other.

# Current Issue

If two computers are on the same network, calls can be made. However, if they are on different networks, calls between them may not work.

# End


```
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  // Handle signaling logic here
  socket.on('offer', (data) => {
    io.to(data.target).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    io.to(data.target).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.target).emit('ice-candidate', data.candidate);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

```

```
<!-- Include necessary scripts like socket.io and adapter.js -->

<script>
  const socket = io.connect('http://localhost:3000');
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const peerConnection = new RTCPeerConnection(configuration);

  // Handle ice candidate events
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        target: remoteUserId,
        candidate: event.candidate,
      });
    }
  };

  // Handle incoming offer
  socket.on('offer', (offer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection.createAnswer().then((answer) => {
      return peerConnection.setLocalDescription(answer);
    }).then(() => {
      socket.emit('answer', { target: remoteUserId, answer: peerConnection.localDescription });
    });
  });

  // Handle incoming answer
  socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  // Handle incoming ice candidate
  socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });

  // Add your code to get user media, create offer, and start the call
</script>
```

