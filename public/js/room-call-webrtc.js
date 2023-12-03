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
let isMuteMic = false;
let isMuteCam = false;
let remoteUserId;
let audioSender;
let videoSender;
let sharingScreen = false;

function toggleSharing() {
    if (sharingScreen) {
        // if you share screen, change to share camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(cameraStream => {
                cameraStream.getVideoTracks()[0].onended = function () {
                    toggleSharing();
                };

                localVideo.srcObject = cameraStream;
                videoSender.replaceTrack(cameraStream.getVideoTracks()[0]);
                // Cập nhật trạng thái
                sharingScreen = false;

                if (isMuteCam) {
                    muteVideo();
                }
            })
            .catch(error => {
                console.error('Error getting camera media:', error);
            });
    } else {
        // if you share camera, change to share screen
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(screenStream => {
                screenStream.getVideoTracks()[0].onended = function () {
                    toggleSharing();
                };

                localVideo.srcObject = screenStream;
                videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
                sharingScreen = true;
            })
            .catch(error => {
                console.error('Error getting screen media:', error);
            });
    }
}

// mute audio
function muteAudio() {
    if (peerConnection.getSenders().length === 0) return;
    if (audioSender === undefined) return;
    audioSender.track.enabled = false;
}
// unmute audio
function unmuteAudio() {
    if (peerConnection.getSenders().length === 0) return;
    if (audioSender === undefined) return;
    audioSender.track.enabled = true;
}
// mute video
function muteVideo() {
    if (peerConnection.getSenders().length === 0) return;
    if (videoSender === undefined) return;
    videoSender.track.enabled = false;
    console.log('auto mute video');
}
// Mute video
function unmuteVideo() {
    if (peerConnection.getSenders().length === 0) return;
    if (videoSender === undefined) return;
    videoSender.track.enabled = true;
}

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

    async function createPeerConnection() {
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

        audioSender = peerConnection.getSenders().find(sender => sender.track.kind === 'audio');
        videoSender = peerConnection.getSenders().find(sender => sender.track.kind === 'video');

        if (!remoteUserId) {
            console.log('emit ready to call');
            socket.emit('ready-call', roomId);
        }
    }

    socket.on('new-user', (data) => {
        const { newUserId, newUsername } = data;
        remoteUserId = newUserId;

        $('#remote-user-name').text(newUsername);
        socket.emit('display-name', { username, roomId: roomName });
        displayMessage(`${newUsername} joined the room`, '🤖🤖🤖');
    });

    socket.on('display-name', (userRemoteName) => {
        $('#remote-user-name').text(userRemoteName);
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

        // handle mute mic or mute camera from localStorage
        if (localStorage.getItem('micAllowed') == 'false') {
            $('.utils .audio').trigger('click');
            isMuteMic = true;
            muteAudio();
        }
        if (localStorage.getItem('camAllowed') == 'false') {
            $('.utils .novideo').trigger('click');
            isMuteCam = true;
            muteVideo();
        }
    })();

    socket.on('end-call', async () => {
        try {
            remoteVideo.srcObject = null;
            // swap video tag
            $('#localVideo').removeClass('video-remote');
            $('#remoteVideo').addClass('video-remote');
            peerConnection.close();
            await createPeerConnection();

            $("#remote-user-name").text("");
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

    // local/remove video
    $('#remoteVideo').on('loadedmetadata', function () {
        // console.log('Video metadata đã được tải.');
        // console.log('Độ phân giải: ' + this.videoWidth + 'x' + this.videoHeight);
    });
    // Lắng nghe sự kiện error cho video
    $('#remoteVideo').on('loadeddata', function () {
        // console.log('Dữ liệu video đã được tải.');
        // swap video tag
        $('#remoteVideo').removeClass('video-remote');
        $('#localVideo').addClass('video-remote');
    });

    // feature: share screen 
    $('.share-screen').on('click', async () => {
        toggleSharing();
    });

});

function displayMessage(message, sender, timeSent = undefined, isMe = false, file = undefined) {
    // format date now to hh:mm:ss AM
    timeSent = timeSent || moment(Date.now()).format('hh:mm:ss A');

    if (file !== undefined) {
        const isImage = file.type.includes('image');
        const isVideo = file.type.includes('video');
        const isAudio = file.type.includes('audio');

        if (isImage) {
            $('#chatBox').append(`
            <div class="message ${isMe ? 'message-right' : 'message-left'}">
                <strong>${sender}<small>${timeSent}</small></strong>
                <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                    <a class="image-player d-block image-popup" href="${file.cloudinaryUrl}" title="${file.name}">
                        <img class="w-100" src="${file.cloudinaryUrl}"></img>
                    </a>
                </div>
            </div>
        `);
        } else if (isVideo) {

            $('#chatBox').append(`
            <div class="message ${isMe ? 'message-right' : 'message-left'}">
                <strong>${sender}<small>${timeSent}</small></strong>
                <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                    <a class="video-player image-popup" href="${file.cloudinaryUrl}" title="${file.name}">
                        <video class="w-100" src="${file.cloudinaryUrl}" controls></video>
                    </a>
                </div>
            </div>
        `);
        } else if (isAudio) {

            $('#chatBox').append(`
            <div class="message ${isMe ? 'message-right' : 'message-left'}">
                <strong>${sender}<small>${timeSent}</small></strong>
                <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                <audio src="${file.cloudinaryUrl}" controls type="audio/mp3"></audio>
                </div>
                </div>
        `);
        } else {

            $('#chatBox').append(`
            <div class="message ${isMe ? 'message-right' : 'message-left'}">
                <strong>${sender}<small>${timeSent}</small></strong>
                <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                <a class="file-download text-decoration-none text-white" 
                href="${file.cloudinaryUrl}" download="${file.name}">
                        <i class="fa-solid fa-file"></i>
                        ${file.name}
                    </a>
                </div>
            </div>
        `);
        }
        magnificPopup();
    } else {
        $('#chatBox').append(`
        <div class="message ${isMe ? 'message-right' : 'message-left'}">
            <strong>${sender}<small>${timeSent}</small></strong>
            <div class="bubble ${isMe ? 'bubble-dark' : 'bubble-light'}">
                ${message}
            </div>
        </div>
    `);
    }

    $('#chatInput').val(isMe ? '' : $('#chatInput').val());
    $('.card-body').scrollTop($('.card-body>#chatBox')[0].scrollHeight);


    tippy('.video-player', {
        content: 'Click to view video!',
    });
    tippy('.image-player', {
        content: 'Click to view image!',
    });
    tippy('.file-download', {
        content: 'Click to download file!',
    });

}


