/* eslint-disable no-undef */
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

    function sendMessage() {
        const message = $('#chatInput').val();
        const sender = 'Your Name'; // Replace with the actual sender's name
        const timeSent = new Date().toLocaleTimeString(); // Get the current time

        $('#chatBox').append(`
            <div class="p-3 my-2 rounded bg-light border">
                <strong>${sender}</strong>
                <p class="mb-0">${message}</p>
                <small>${timeSent}</small>
            </div>
        `);
        $('#chatInput').val('');

        $('#chatBox').scrollTop($('#chatBox')[0].scrollHeight);
    }

    $('#sendButton').on('click', sendMessage);

    $('#chatInput').on('keypress', function (e) {
        if (e.which == 13) {
            sendMessage();
            e.preventDefault();
        }
    });
});