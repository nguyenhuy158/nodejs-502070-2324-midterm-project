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
let targetPeople;
let isAlreadyCalling = false;
const socket = io();

$(() => {
    $('#offlineMessage').hide();
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.relay.metered.ca:80' },
            {
                urls: 'turn:a.relay.metered.ca:80',
                username: 'f53cdafbffcc24c341620211',
                credential: 'IsJ63Gjfyd9x25La',
            },
            {
                urls: 'turn:a.relay.metered.ca:80?transport=tcp',
                username: 'f53cdafbffcc24c341620211',
                credential: 'IsJ63Gjfyd9x25La',
            },
            {
                urls: 'turn:a.relay.metered.ca:443',
                username: 'f53cdafbffcc24c341620211',
                credential: 'IsJ63Gjfyd9x25La',
            },
            {
                urls: 'turn:a.relay.metered.ca:443?transport=tcp',
                username: 'f53cdafbffcc24c341620211',
                credential: 'IsJ63Gjfyd9x25La',
            },
        ],
    };
    let peerConnection;
    let remoteUserId;

    socket.on('room-full', () => {
        toastr.error('room is full');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    });

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to `, err);
        console.log(`connect_error due to ${err.message}`);
    });
    socket.on('connect', () => {
        console.log('Connected to the signaling server with id', socket.id);
        toastr.success('Connected to the signaling server');

        yourUserIdContainer.text(`Your User ID: ${socket.id}`);
        id = socket.id;
    });

    if (roomName !== undefined && roomName !== null && roomName !== '') {
        socket.emit('join-room', roomName);
    }

    socket.on('offer', async (data) => {
        const offer = data.offer;
        remoteUserId = data.target;

        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peerConnection
            .createAnswer()
            .then((answer) => {
                return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
                socket.emit('answer', {
                    target: remoteUserId,
                    answer: peerConnection.localDescription,
                });
            });
    });

    socket.on('answer', (answer) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', (candidate) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    async function createPeerConnection(targetUsername) {
        console.log(`preCall - createPeerConnection`);
        peerConnection = null;
        peerConnection = new RTCPeerConnection(configuration);
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    target: remoteUserId,
                    candidate: event.candidate,
                });
            }
        };
        peerConnection.ontrack = function ({ streams: [stream] }) {
            if (remoteVideo) {
                remoteVideo.srcObject = stream;
            }
        };
        let localMediaStream = localVideo.srcObject;
        if (!localMediaStream) {
            localMediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localVideo.srcObject = localMediaStream;
        }
        peerConnection.addStream(localMediaStream);

        if (!remoteUserId) {
            console.log('emit ready to call');
            socket.emit('ready-call', roomId);
        }
    }

    socket.on('new-user', (userId) => {
        remoteUserId = userId;
    });

    socket.on('ready-call', async () => {
        console.log('socket.on ready call');

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { target: remoteUserId, offer: offer });
        } catch (error) {
            console.error('Error starting the call:', error);
        }
    });

    (async () => {
        await createPeerConnection();
    })();

    socket.on('end-call', async () => {
        try {
            remoteVideo.srcObject = null;
            peerConnection.close();
            await createPeerConnection();
        } catch (error) {
            console.error('Error ending the call:', error);
        }
    });

    socket.on('connect_error', (err) => {
        console.log(`connect_error due to `, err);
        console.log(`connect_error due to ${err.message}`);
    });

    // Handle the 'user-not-found' event
    socket.on('user-not-found', (targetUserId) => {
        const message = `User with ID ${targetUserId} not found`;
        toastr.error(message);
    });

    $('#createroom').on('click', () => {
        const roomName = 'myRoom';
        socket.emit('createRoom', roomName);
    });

    socket.on('redirectToRoom', (url) => {
        window.location.href = url;
    });

});


let username = 'Anonymous';

function displayMessage(message, sender, timeSent, isMe = false) {
    $('#chatBox').append(`
        <div class="message ${isMe ? 'message-right' : 'message-left'}">
            <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                <strong>${sender}</strong>
                <br>
                ${message}
                <!-- <div><small>${timeSent}</small></div> -->
            </div>
        </div>
    `);

    $('#chatInput').val(isMe ? '' : $('#chatInput').val());

    $('.card-body').scrollTop($('.card-body>#chatBox')[0].scrollHeight);
}

$(() => {

    $.ajax({
        url: '/api/current-user',
        method: 'GET',
        success: function (data) {
            console.log(`🚀 🚀 file: index-chat.js:7 🚀 data`, data);
            toastr.success('User info loaded');

            username = data.username;
            socket.emit('set-username', data.username);
            $('#yourLocalName').text(`Name: ${data.username}`);
        },
        error: function (error) {
            console.log(`🚀 🚀 file: index-chat.js:10 🚀 error`, error);
            toastr.error(error.responseJSON?.message || 'Error loading user info');
        }
    });

    socket.on('chat-message', (data) => {
        displayMessage(data.message, data.sender, data.timeSent);
    });

    function sendMessage() {
        const message = $('#chatInput').val();
        const sender = username;
        const timeSent = new Date().toLocaleTimeString();

        socket.emit('chat-message', {
            roomName,
            message,
            sender,
            timeSent
        });

        displayMessage(message, sender, timeSent, true);
    }

    $('#sendButton').on('click', sendMessage);

    $('#chatInput').on('keypress', function (e) {
        console.log(`🚀 🚀 file: index.js:345 🚀 e`, e);
        if (e.which == 13) {
            sendMessage();
            e.preventDefault();
        }
    });
});