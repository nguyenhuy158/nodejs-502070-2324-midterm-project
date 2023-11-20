/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function isValidCode(code) {
    var pattern = /^[a-z]{3}-[a-z]{3}-[a-z]{3}$/;

    return pattern.test(code);
}

const createButton = document.querySelector("#createroom");
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
        socket.on('redirectToRoom', (url) => {
            window.location.href = url;
        });
    }, 1000);
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
    location.href = `/room/${code}`;
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
});
