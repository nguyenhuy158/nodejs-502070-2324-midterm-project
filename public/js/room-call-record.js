/* eslint-disable no-undef */
// let isRecording = false;
let isRecording = true;
$(() => {
    // Assuming you have a WebRTC peer connection named 'peerConnection' and video elements with IDs 'localVideo' and 'remoteVideo'
    let localVideo = document.getElementById('localVideo');
    let remoteVideo = document.getElementById('remoteVideo');
    const codecPreferences = document.querySelector('#codecPreferences');

    let mediaRecorder;
    let recordedBlobs;

    function handleDataAvailable(event) {
        console.log('handleDataAvailable', event);
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    $('.record').on('click', async () => {
        let localStream = localVideo.srcObject;
        let remoteStream = remoteVideo.srcObject;

        if (isRecording) {
            console.log(`$ 🚀 localStream`, localStream);
            recordedBlobs = [];
            const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
            const options = { mimeType };

            try {
                mediaRecorder = new MediaRecorder(window.stream, options);
            } catch (e) {
                console.error('Exception while creating MediaRecorder:', e);
                return;
            }

            console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
            recordButton.textContent = 'Stop Recording';
            mediaRecorder.onstop = (event) => {
                console.log('Recorder stopped: ', event);
                console.log('Recorded Blobs: ', recordedBlobs);
            };
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start();
            console.log('MediaRecorder started', mediaRecorder);

            isRecording = false;
        } else {
            stopRecording();
            isRecording = true;
        }

        // if (isRecording) {
        //     // Stop recording
        //     // mediaRecorder.stop();
        //     isRecording = false;
        //     console.log('Recording stopped');

        //     console.log(`$ 🚀 localStream`, localStream);
        //     let recorder = new RecordRTCPromisesHandler(localStream, {
        //         type: 'video'
        //     });
        //     recorder.startRecording();
        //     console.log('Recording stopped');

        //     const sleep = m => new Promise(r => setTimeout(r, m));
        //     console.log('Recording stopped');
        //     await sleep(3000);
        //     console.log('Recording stopped');

        //     console.log('Recording stopped');
        //     await recorder.stopRecording();
        //     console.log('Recording stopped');
        //     let blob = await recorder.getBlob();
        //     console.log('Recording stopped');
        //     invokeSaveAsDialog(blob);
        //     console.log('Recording stopped');
        // } else {
        //     // Start recording
        //     // mediaRecorder.start();
        //     isRecording = true;
        //     console.log('Recording started');
        // }
    });

    function stopRecording() {
        mediaRecorder.stop();
    }
    // // Create MultiStreamRecorder instance
    // const multiStreamRecorder = new MultiStreamRecorder([localStream, remoteStream], {
    //     mimeType: 'video/webm',
    //     audioContext: true,
    //     previewStream: function (stream) {
    //         // You can do something with the preview stream if needed
    //     },
    // });

    // // Start recording when the button is clicked
    // document.getElementById('startRecordingButton').addEventListener('click', () => {
    //     multiStreamRecorder.start();
    // });

    // // Stop recording when the button is clicked
    // document.getElementById('stopRecordingButton').addEventListener('click', () => {
    //     multiStreamRecorder.stop();
    // });

    // // Handle the recorded data
    // multiStreamRecorder.ondataavailable = function (blobs) {
    //     // blobs is an array of Blob objects, one for each stream
    //     const combinedBlob = new Blob(blobs, { type: 'video/webm' });

    //     // Create a download link for the combined blob
    //     const downloadLink = document.createElement('a');
    //     downloadLink.href = URL.createObjectURL(combinedBlob);
    //     downloadLink.download = 'combined-video.webm';
    //     downloadLink.click();
    // };
});