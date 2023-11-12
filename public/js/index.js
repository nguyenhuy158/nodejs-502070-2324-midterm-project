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
let targetUsername;
const socket = io();

$(() => {
    socket.on('connect', () => {
        console.log('Connected to the signaling server with id', socket.id);
        showToast('success', 'Connected to the signaling server');

        yourUserIdContainer.text(`Your User ID: ${socket.id}`);
        id = socket.id;
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

    // Create a new WebRTC peer connection
    async function createPeerConnection(targetUsername) {
        var peerConfiguration = {};

        const response = await fetch(
            'https://callmate.metered.live/api/v1/turn/credentials?apiKey=3bf717e4817d41a4378051971e5079829755',
        );
        const iceServers = await response.json();
        peerConfiguration.iceServers = iceServers;
        console.log(`peerConfiguration.iceServers`, peerConfiguration.iceServers);


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
            console.log(`🚀 event`, event);
            console.log(`🚀 event.candidate`, event.candidate);
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate, targetUsername);
            }
        };
    }

    async function makeCall(targetUsername) {
        await createPeerConnection(targetUsername);

        // // Create an SDP offer
        // peerConnection
        //     .createOffer()
        //     .then((offer) => {
        //         console.log(`offer`, offer);
        //         return peerConnection.setLocalDescription(offer);
        //     })
        //     .then(() => {
        //         // Send the offer to the other peer
        //         socket.emit('offer', peerConnection.localDescription, targetUsername);
        //     })
        //     .catch((error) => {
        //         console.error('Error creating offer:', error);
        //     });
        // Create an SDP offer
        try {
            const offer = await peerConnection.createOffer();
            console.log(`offer`, offer);
            await peerConnection.setLocalDescription(offer);

        // Send the offer to the other peer
            socket.emit('offer', peerConnection.localDescription, targetUsername);
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    // Handle the "Start Call" button click event
    startCallButton.on('click', async () => {
        targetUsername = prompt('enter partner name:');
        await makeCall(targetUsername);
    });

    // Handle the "End Call" button click event
    endCallButton.on('click', () => {
        if (peerConnection) {
            peerConnection.close();
            remoteVideo.srcObject = null;
        }
    });

    // Handle incoming offers from the other peer
    socket.on('offer', async (offer, callerUsername) => {
        console.log(`🚀 sourceSocketId`, callerUsername);
        console.log(`🚀 offer`, offer);
        try {
            // Create a peer connection
            await createPeerConnection(callerUsername);

            // Set the remote description and create an answer
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // Send the answer to the other peer
            socket.emit('answer', peerConnection.localDescription, callerUsername);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    });

    // Handle incoming answers from the other peer
    socket.on('answer', async (answer, targetUsername) => {
        console.log(`🚀 targetUsername`, targetUsername);
        console.log(`🚀 answer`, answer);
        try {
            // Set the remote description
            await peerConnection.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    });

    // Handle incoming ICE candidates from the other peer
    socket.on('ice-candidate', (candidate) => {
        console.log(`🚀 candidate`, candidate);
        if (peerConnection) {
            // Add the ICE candidate to the peer connection
            peerConnection.addIceCandidate(candidate);
        } else {
            console.log('peerConnection is undefined or null.');
        }
    });

    // Event handler for the "Submit Name" button click event
    submitNameButton.on('click', () => {
        const userName = userNameInput.val().trim();
        if (userName !== '') {
            socket.emit('set-username', userName);
            userNameInput.parent().hide();
        }
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


    // Function to remove active users
    function removeActiveUsers(data) {
        console.log(`🚀 data`, data);
        $.each(data, function (key) {
            let li = listActiveList.find('li').filter(function () {
                return $(this).text().trim() === key;
            });
            li.remove();
        });
    }

    // Function to add new active users
    function addNewActiveUsers(data) {
        console.log(`🚀 data`, data);
        $.each(data, function (key, value) {
            const li = $(`<li class="list-group-item text-truncate btn-call" role="button" data-id=${value}>`).text(`${key}`);
            listActiveList.append(li);
        });

        assignCallButtonEvent();
    }

    // Function to update the active user list
    function updateActiveList(data) {
        console.log(`🚀 data`, data);
        listActiveList.empty();

        $.each(data, function (key, value) {
            const li = $(`<li class="list-group-item text-truncate btn-call" role="button" data-id=${value}>`).text(`${key}`);
            listActiveList.append(li);
        });

        assignCallButtonEvent();
    }

    // Function to assign click event to call button
    function assignCallButtonEvent() {
        $('.btn-call').off('click').on('click', async function () {
            console.log($(this).text());

            const name = $(this).text();
            await makeCall(name);
        });
    }

    // Socket event listeners
    socket.on('remove-active', removeActiveUsers);
    socket.on('new-active', addNewActiveUsers);
    socket.on('active-list', updateActiveList);
});