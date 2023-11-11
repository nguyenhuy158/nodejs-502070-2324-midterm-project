/* eslint-disable no-undef */

function displayMessage(message, sender, timeSent, isMe = false) {
    $('#chatBox').append(`
        <div class="p-3 my-2 rounded bg-light border">
            <strong>${sender}</strong>
            <p class="mb-0">${message}</p>
            <small>${timeSent}</small>
        </div>
    `);

    $('#chatInput').val(isMe ? '' : $('#chatInput').val());

    $('#chatBox').scrollTop($('#chatBox')[0].scrollHeight);
}
$(() => {

    $.ajax({
        url: '/api/current-user',
        method: 'GET',
        success: function (data) {
            console.log(`🚀 🚀 file: index-chat.js:7 🚀 data`, data);
            showToast('success', 'User info loaded');

            setInterval(function () {
                socket.emit('set-username', data.username);
            }, 3000);
        },
        error: function (error) {
            console.log(`🚀 🚀 file: index-chat.js:10 🚀 error`, error);
            showToast('error', error.responseJSON?.message || 'Error loading user info');
        }
    });

    socket.on('chat-message', (data) => {
        displayMessage(data.message, data.sender, data.timeSent);
    });

    function sendMessage() {
        const message = $('#chatInput').val();
        const sender = 'Your Name';
        const timeSent = new Date().toLocaleTimeString();

        socket.emit('chat-message', {
            message,
            sender,
            timeSent
        });

        displayMessage(message, sender, timeSent, true);
    }

    $('#sendButton').on('click', sendMessage);

    $('#chatInput').on('keypress', function (e) {
        if (e.which == 13) {
            sendMessage();
            e.preventDefault();
        }
    });
});