/* eslint-disable no-undef */
$(() => {
    // Assuming you have a WebRTC peer connection named 'peerConnection' and video elements with IDs 'localVideo' and 'remoteVideo'
    let localVideo = document.getElementById('localVideo');
    let remoteVideo = document.getElementById('remoteVideo');
    let localStream = localVideo.srcObject;
    let remoteStream = remoteVideo.srcObject;

    // Create MultiStreamRecorder instance
    const multiStreamRecorder = new MultiStreamRecorder([localStream, remoteStream], {
        mimeType: 'video/webm',
        audioContext: true,
        previewStream: function (stream) {
            // You can do something with the preview stream if needed
        },
    });

    // Start recording when the button is clicked
    document.getElementById('startRecordingButton').addEventListener('click', () => {
        multiStreamRecorder.start();
    });

    // Stop recording when the button is clicked
    document.getElementById('stopRecordingButton').addEventListener('click', () => {
        multiStreamRecorder.stop();
    });

    // Handle the recorded data
    multiStreamRecorder.ondataavailable = function (blobs) {
        // blobs is an array of Blob objects, one for each stream
        const combinedBlob = new Blob(blobs, { type: 'video/webm' });

        // Create a download link for the combined blob
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(combinedBlob);
        downloadLink.download = 'combined-video.webm';
        downloadLink.click();
    };
});