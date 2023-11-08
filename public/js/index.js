/* eslint-disable no-undef */

const userNameInput = $('#userNameInput');
const submitNameButton = $('#submitName');
const yourNameContainer = $('#yourNameContainer');

const localVideo = $('#localVideo');
const remoteVideo = $('#remoteVideo');
const startCallButton = $('#startCall');
const endCallButton = $('#endCall');
const yourUserIdContainer = $('#yourUserIdContainer');
const errorMessageContainer = $('#errorMessageContainer');
const btnLoadActiveList = $('#load-active-list');
const listActiveList = $('#active-list');

let id;

let localStream;
let peerConnection;
let targetSocketId;
const socket = io();

// Get access to user's camera and microphone
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing user media:', error);
    });

// Handle the 'your-id' event to get and display the user's ID
socket.on('your-id', (userId) => {
    yourUserIdContainer.innerText = `Your User ID: ${userId}`;
    id = userId;
});

// Create a new WebRTC peer connection
async function createPeerConnection() {
    var peerConfiguration = {};

    await (async () => {
        const response = await fetch(
            'https://callmate.metered.live/api/v1/turn/credentials?apiKey=3bf717e4817d41a4378051971e5079829755',
        );
        const iceServers = await response.json();
        peerConfiguration.iceServers = iceServers;
        console.log(`🚀 🚀 file: index.ejs:84 🚀 await 🚀 peerConfiguration`, peerConfiguration);
    })();

    peerConnection = new RTCPeerConnection(peerConfiguration);
    console.log(`🚀 🚀 file: index.ejs:88 🚀 createPeerConnection 🚀 peerConnection`, peerConnection);

    // const configuration = {
    //     iceServers: [
    //         {
    //             urls: 'turn:openrelay.metered.ca:80',
    //             username: 'openrelayproject',
    //             credential: 'openrelayproject',
    //         },
    //     ],
    // }

    // peerConnection = new RTCPeerConnection(configuration)

    // Add the local stream to the peer connection
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle remote video stream when it arrives
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Handle ICE candidate events by sending them to the other peer
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, targetSocketId);
        }
    };
}

// Handle the "Start Call" button click event
startCallButton.on('click', async () => {
    // porm
    targetSocketId = prompt('enter target socket id');

    // Create a peer connection
    await createPeerConnection();

    // Create an SDP offer
    peerConnection
        .createOffer()
        .then((offer) => {
            return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
            // Send the offer to the other peer
            socket.emit('offer', peerConnection.localDescription, targetSocketId);
        })
        .catch((error) => {
            console.error('Error creating offer:', error);
        });
});

// Handle the "End Call" button click event
endCallButton.on('click', () => {
    // Close the peer connection and reset video elements
    if (peerConnection) {
        peerConnection.close();
        remoteVideo.srcObject = null;
    }
});

// Handle incoming offers from the other peer
socket.on('offer', (offer, sourceSocketId) => {
    // Create a peer connection
    createPeerConnection();

    // Set the remote description and create an answer
    peerConnection
        .setRemoteDescription(offer)
        .then(() => peerConnection.createAnswer())
        .then((answer) => peerConnection.setLocalDescription(answer))
        .then(() => {
            // Send the answer to the other peer
            socket.emit('answer', peerConnection.localDescription, sourceSocketId);
        })
        .catch((error) => {
            console.error('Error handling offer:', error);
        });
});

// Handle incoming answers from the other peer
socket.on('answer', (answer) => {
    // Set the remote description
    peerConnection.setRemoteDescription(answer);
});

// Handle incoming ICE candidates from the other peer
socket.on('ice-candidate', (candidate) => {
    // Add the ICE candidate to the peer connection
    peerConnection.addIceCandidate(candidate);
});

// Event handler for the "Submit Name" button click event
submitNameButton.on('click', () => {
    const userName = userNameInput.value.trim(); // Get the entered name
    if (userName !== '') {
        socket.emit('set-username', userName); // Emit the name to the server
        userNameInput.parentElement.hidden = true;
    }
});

socket.on('your-name', (userName) => {
    yourNameContainer.innerText = `Your Name: ${userName}`; // Display the user's name
});

socket.on('connect_error', (err) => {
    console.log(`connect_error due to `, err);
    console.log(`connect_error due to ${err.message}`);
});

// Handle the 'user-not-found' event
socket.on('user-not-found', (targetUserId) => {
    errorMessageContainer.innerText = `User with ID ${targetUserId} not found`;
});

btnLoadActiveList.on('click', () => {
    socket.emit('get-active-list');
});

socket.on('active-list', (data) => {
    listActiveList.empty();

    $.each(data, function (key, value) {
        console.log(`${key}: ${value}`);

        const li = $('<li class="list-group-item">').text(key);
        listActiveList.append(li);
    });
});


socket.emit('get-active-list');