/* eslint-disable no-undef */
// video call funciton

// TODO: can not display video call


// Chat form function 
$(document).ready(function () {

    // Emoji onclick event
    $('#showIcons').click(function () {
        $('.icon-list').css('display', 'flex');
    });
    $('.icon').click(function () {
        const selectedIcon = $(this).data('icon');
        $('.icon-list').hide();
        $('#chatInput').val($('#chatInput').val() + selectedIcon);
    });

    // Cancel button call
    $('.cutcall').on('click', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to leave this page.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, leave!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/';
            }
        });
    });

    // Copy room ID
    $('#roomName').on('click', function () {
        const copyText = $(this).data('id');

        navigator.clipboard.writeText(copyText)
            .then(function () {
                console.log("Text successfully copied to clipboard");
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Room ID copied to clipboard',
                });
            }).catch(function (err) {
                console.error("Unable to copy text to clipboard", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                });
            });
    });

    // Handle chat form
    $.ajax({
        url: '/api/current-user',
        method: 'GET',
        success: function (data) {
            username = data.username;
            socket.emit('set-username', data.username);
        },
        error: function (error) {
            console.log(`🚀 error`, error);
        }
    });

    socket.on('chat-message', (data) => {
        displayMessage(data.message, data.sender, data.timeSent);
    });

    function sendMessage() {
        const message = $('#chatInput').val();
        const sender = username;
        const timeSent = new Date().toLocaleTimeString();

        socket.emit('chat-message', {
            roomName,
            message,
            sender,
            timeSent
        });

        displayMessage(message, sender, timeSent, true);
    }

    $('#sendButton').on('click', sendMessage);

    $('#chatInput').on('keypress', function (e) {
        const message = $('#chatInput').val();
        if (e.which == 13 && message.trim() !== '') {
            sendMessage();
            e.preventDefault();
        }
    });
});



// TODO 2: When click Other button, can't turn off by clicking it again. Button Emoji also have the same error 
