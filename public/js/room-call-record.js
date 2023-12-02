/* eslint-disable no-undef */
let isRecording = false;
let timerInterval;
let recordingDuration = 0;

$(() => {
    let localVideo = document.getElementById('localVideo');
    let remoteVideo = document.getElementById('remoteVideo');

    let mediaRecorder;
    let recordedChunks = [];

    function handleStream(stream) {
        try {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = function () {
                clearInterval(timerInterval);
                let recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });

                let downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(recordedBlob);
                downloadLink.download = 'recorded-video.webm';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                recordedChunks = [];
                recordingDuration = 0;
                $('#timer').text('');
            };
        } catch (error) {
            console.log(`handleStream 🚀 error`, error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No video stream available. Please check your camera settings.',
            });
        }
    }

    $('.record').on('click', async () => {
        let localStream = localVideo.srcObject;

        if (isRecording) {
            mediaRecorder.stop();
            clearInterval(timerInterval);

            isRecording = false;
        } else {
            console.log(`$ 🚀 localStream`, localStream);
            handleStream(localStream);

            recordedChunks = [];
            mediaRecorder.start();

            timerInterval = setInterval(() => {
                $('#timer').text(`Recording: ${moment.utc((++recordingDuration) * 1000).format('mm:ss')}`);
            }, 1000);

            isRecording = true;
        }
    });
});