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
        toastr.error('Room is full, please create new room or enter other room id');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    });
    socket.on('room-not-found', () => {
        toastr.error('Room not exist, please create new room or enter new room id');
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
        displayMessage(`Connected to signaling server`, '🤖🤖🤖');

        yourUserIdContainer.text(`Your User ID: ${socket.id}`);
        id = socket.id;
    });


    if (roomName !== undefined && roomName !== null && roomName !== '') {
        socket.emit('join-room', roomName);
        // displayMessage(`Join room ${roomName} success`, '🤖🤖🤖');
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

});

function displayMessage(message, sender, timeSent, isMe = false) {
    $('#chatBox').append(`
        <div class="message ${isMe ? 'message-right' : 'message-left'}">
            <strong>${sender}</strong>
            <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                ${message}
                <!-- <div><small>${timeSent}</small></div> -->
            </div>
        </div>
    `);

    $('#chatInput').val(isMe ? '' : $('#chatInput').val());

    $('.card-body').scrollTop($('.card-body>#chatBox')[0].scrollHeight);
}