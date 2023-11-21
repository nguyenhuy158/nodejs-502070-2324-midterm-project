/* eslint-disable no-undef */

// Chat form function 
$(() => {

    // Click outside hide emoji list
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#showIcons').length) {
            $('.icon-list').removeClass('d-flex').hide();
            console.log('click');
        }
    });

    // Emoji onclick event
    $('#showIcons').on('click', function () {
        $('.icon-list').toggleClass('d-flex');
    });
    $('.icon').on('click', function () {
        const selectedIcon = $(this).data('icon');
        $('.icon-list').removeClass('d-flex').hide();
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

    // mute mic
    $('.utils .audio').on('click', function () {
        // TODO: function mute mic

        $('#mute-mic-icon').toggleClass('d-none');
        $(this).find('i').toggleClass('fa-microphone').toggleClass('fa-microphone-slash');
    });

    // mute camera
    $('.utils .novideo').on('click', function () {
        // TODO: function mute cam

        $('#mute-cam-icon').toggleClass('d-none');
        $(this).find('i').toggleClass('fa-video').toggleClass('fa-video-slash');
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

        if (message.trim() !== '') {
            socket.emit('chat-message', {
                roomName,
                message,
                sender,
                timeSent
            });
            displayMessage(message, sender, timeSent, true);
        }
    }

    $('#sendButton').on('click', sendMessage);

    $('#chatInput').on('keypress', function (e) {
        if (e.which == 13) {
            sendMessage();
            e.preventDefault();
        }
    });

    // invite friend
    $('#invite').on('click', function () {
        Swal.fire({
            title: "Enter username to invite",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Invite",
            showLoaderOnConfirm: true,
            preConfirm: async (inviteUsername) => {
                try {
                    // TODO: change to invite url
                    const response = await fetch('/api/current-user', {
                        method: 'GET',
                    });
                    console.log(`🚀 response`, response);

                    if (!response.ok) {
                        return Swal.showValidationMessage(response.statusText);
                    }
                    return inviteUsername;
                } catch (error) {
                    console.log(`🚀 error`, error);

                    Swal.showValidationMessage(error + inviteUsername);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(`🚀 result`, result);

                Swal.fire({
                    title: `Invite ${result.value} successfully!`,
                });
            }
        });
    });
});
