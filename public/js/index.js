/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const userNameInput = $('#userNameInput');
const submitNameButton = $('#submitName');
const yourRemoteName = $('#yourRemoteName');
const yourLocalName = $('#yourLocalName');

const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');
const startCallButton = $('#startCall');
const endCallButton = $('#endCall');
const yourUserIdContainer = $('#yourUserIdContainer');
const btnLoadActiveList = $('#load-active-list');
const btnLoadLocalSteam = $('#load-local-stream');
const listActiveList = $('#active-list');


let id;
let localStream;
let peerConnection;
let targetSocketId;
const socket = io();

$(() => {
    socket.on('connect', () => {
        console.log('Connected to the signaling server with id', socket.id);
        showToast('success', 'Connected to the signaling server');
    });

    $('#offlineMessage').hide();

    // Handle the "Load Local Stream" button click event
    btnLoadLocalSteam.on('click', async function requestUserMedia() {
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            localStream = stream;
            localVideo.srcObject = stream;

        } catch (err) {
            console.error('Failed to get media stream:', err);
        }
    });
    // trigger the click event on the button
    btnLoadLocalSteam.trigger('click');

    // Handle the 'your-id' event to get and display the user's ID
    socket.on('your-id', (userId) => {
        console.log(`🚀 🚀 file: index.js:44 🚀 socket.on 🚀 userId`, userId);
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
            console.log(`🚀 🚀 file: index.js:57 🚀 await 🚀 peerConfiguration.iceServers`, peerConfiguration.iceServers);
        })();

        peerConnection = new RTCPeerConnection(peerConfiguration);
        console.log(`🚀 🚀 file: index.ejs:88 🚀 createPeerConnection 🚀 peerConnection`, peerConnection);

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

    async function makeCall(targetSocketId) {
        await createPeerConnection();

        // Create an SDP offer
        peerConnection
            .createOffer()
            .then((offer) => {
                console.log(`🚀 🚀 file: index.js:107 🚀 .then 🚀 offer`, offer);
                return peerConnection.setLocalDescription(offer);
            })
            .then(() => {
                // Send the offer to the other peer
                socket.emit('offer', peerConnection.localDescription, targetSocketId);
            })
            .catch((error) => {
                console.error('Error creating offer:', error);
            });
    }

    // Handle the "Start Call" button click event
    startCallButton.on('click', async () => {
        targetSocketId = prompt('enter partner name:');
        await makeCall(targetSocketId);
    });

    // Handle the "End Call" button click event
    endCallButton.on('click', () => {
        if (peerConnection) {
            peerConnection.close();
            remoteVideo.srcObject = null;
        }
    });

    // Handle incoming offers from the other peer
    socket.on('offer', async (offer, sourceSocketId) => {
        console.log(`🚀 🚀 file: index.js:129 🚀 socket.on 🚀 sourceSocketId`, sourceSocketId);
        console.log(`🚀 🚀 file: index.js:144 🚀 socket.on 🚀 offer`, offer);
        try {
            // Create a peer connection
            await createPeerConnection();

            // Set the remote description and create an answer
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // Send the answer to the other peer
            socket.emit('answer', peerConnection.localDescription, sourceSocketId);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    });

    // Handle incoming answers from the other peer
    socket.on('answer', async (answer) => {
        console.log(`🚀 🚀 file: index.js:156 🚀 socket.on 🚀 answer`, answer);
        try {
            // Set the remote description
            await peerConnection.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    });

    // Handle incoming ICE candidates from the other peer
    socket.on('ice-candidate', (candidate) => {
        // Add the ICE candidate to the peer connection
        peerConnection.addIceCandidate(candidate);
    });

    // Event handler for the "Submit Name" button click event
    submitNameButton.on('click', () => {
        const userName = userNameInput.val().trim();
        if (userName !== '') {
            socket.emit('set-username', userName);
            userNameInput.parent().hide();
        }
    });

    socket.on('your-name', (userName) => {
        yourLocalName.text(`Name: ${userName}`);
    });

    socket.on('connect_error', (err) => {
        console.log(`connect_error due to `, err);
        console.log(`connect_error due to ${err.message}`);
    });

    // Handle the 'user-not-found' event
    socket.on('user-not-found', (targetUserId) => {
        const message = `User with ID ${targetUserId} not found`;
        showToast('error', message);
    });

    btnLoadActiveList.on('click', () => {
        socket.emit('get-active-list');
    });

    socket.on('active-list', (data) => {
        listActiveList.empty();

        $.each(data, function (key, value) {
            showToast('success', 'Active list loaded');
            const li = $('<li class="list-group-item text-truncate btn-call" role="button">').text(`${key}`);
            listActiveList.append(li);
        });

        $('.btn-call').off('click').on('click', async function () {
            console.log($(this).text());

            const name = $(this).text();
            await makeCall(name);
        });

    });

    // Start emitting the event every 3 seconds
    const intervalId = setInterval(() => {
        socket.emit('get-active-list');
    }, 5000);

    // Stop emitting the event after 30 seconds
    setTimeout(() => {
        clearInterval(intervalId);
    }, 30000);

});