/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function isValidCode(code) {
    var pattern = /^[a-z]{3}-[a-z]{3}-[a-z]{3}$/;

    return pattern.test(code);
}

const createButton = document.querySelector("#createroom");
const realTime = document.querySelector("#time");
const videoCont = document.querySelector('.video-self');
const codeCont = document.querySelector('#roomcode');
const joinBut = document.querySelector('#joinroom');
const mic = document.querySelector('#mic');
const cam = document.querySelector('#webcam');
const createroomtext = 'Creating Room...';

let micAllowed = true;
let camAllowed = true;

let mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(localstream => {
        videoCont.srcObject = localstream;
    });

$('.logout').on('click', function (e) {
    e.preventDefault();

    Swal.fire({
        title: 'Are you sure to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, see ya!',
        cancelButtonText: 'No, just kidding!',
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/logout';
            localStorage.clear();
        }
    });
});

createButton.addEventListener('click', (e) => {
    e.preventDefault();

    createButton.disabled = true;
    createButton.innerHTML = 'Creating Room';
    createButton.classList = 'createroom-clicked';

    setInterval(() => {
        if (createButton.innerHTML < createroomtext) {
            createButton.innerHTML = createroomtext.substring(0, createButton.innerHTML.length + 1);
        }
        else {
            createButton.innerHTML = createroomtext.substring(0, createButton.innerHTML.length - 3);
        }
    }, 500);

    setTimeout(() => {
        socket.emit('createRoom');
    }, 2000);
});

socket.on('redirectToRoom', (url) => {
    window.location.href = url;
});

joinBut.addEventListener('click', (e) => {
    e.preventDefault();
    if (codeCont.value.trim() == "") {
        codeCont.classList.add('roomcode-error');
        toastr.error('Please enter room code');
        $('#roomcode').focus();
        return;
    }
    if (!isValidCode(codeCont.value.trim())) {
        toastr.error('Invalid room code');
        $('#roomcode').focus();
        return;
    }

    const code = codeCont.value;
    socket.emit('join', code);

    socket.on('room-not-found', () => {
        toastr.error('Room not exist, please create new room or enter new room id');
    });
});

$('#roomcode').on('keypress', function (e) {
    // check enter key
    if (e.which === 13) {
        e.preventDefault();
        joinBut.click();
    }
});

codeCont.addEventListener('change', (e) => {
    e.preventDefault();
    if (codeCont.value.trim() !== "") {
        codeCont.classList.remove('roomcode-error');
        return;
    }
});

cam.addEventListener('click', () => {
    if (camAllowed) {
        mediaConstraints = { video: false, audio: micAllowed };
        if (micAllowed) {
            navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(localstream => {
                    videoCont.srcObject = localstream;
                });
        } else {
            videoCont.srcObject = null;
        }

        cam.classList = "nodevice";
        cam.innerHTML = `<i class="fas fa-video-slash"></i>`;
        camAllowed = false;

    } else {
        mediaConstraints = { video: true, audio: micAllowed };
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localstream => {
                videoCont.srcObject = localstream;
            });

        cam.classList = "device";
        cam.innerHTML = `<i class="fas fa-video"></i>`;
        camAllowed = true;

    }
    localStorage.setItem('camAllowed', camAllowed);
});

mic.addEventListener('click', () => {
    if (micAllowed) {
        mediaConstraints = { video: camAllowed, audio: false };
        if (camAllowed) {
            navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(localstream => {
                    videoCont.srcObject = localstream;
                });
        } else {
            videoCont.srcObject = null;
        }

        mic.classList = "nodevice";
        mic.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        micAllowed = false;

    } else {
        mediaConstraints = { video: camAllowed, audio: true };
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localstream => {
                videoCont.srcObject = localstream;
            });

        mic.innerHTML = `<i class="fas fa-microphone"></i>`;
        mic.classList = "device";
        micAllowed = true;

    }
    localStorage.setItem('micAllowed', micAllowed);
});

$(() => {
    localStorage.setItem('camAllowed', true);
    localStorage.setItem('micAllowed', true);

    socket.on('invite', (data) => {
        console.log(`🚀 🚀 file: landing.js:168 🚀 socket.on 🚀 data`, data);
        const { roomName, userInvited, inviteLink } = data;
        Swal.fire({
            title: `<strong>User ${userInvited} invite you to join room</strong>`,
            icon: 'info',
            html: `
                        <div>
                            <p>Room id: ${roomName}</p>
                            <p>Click <a href="${inviteLink}">here</a> to join</p>
                        </div>
                    `,
            focusConfirm: false,
            confirmButtonText: 'Close!',
            timer: 10 * 1000,
            timerProgressBar: true,
            confirmButtonAriaLabel: 'Thumbs up, great!',
        });
    });
});

function updateTime() {
    realTime.textContent = moment().format('hh:mm:ss A');
}
setInterval(updateTime, 1000);
