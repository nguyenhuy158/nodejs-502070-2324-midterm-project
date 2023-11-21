/* eslint-disable no-undef */

// Chat form function 
$(() => {

    // Click outside hide emoji list
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#showIcons').length) {
            $('.icon-list').removeClass('d-flex').hide();
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
    $(document).on('click', '#roomName, .invite-link', function () {
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
        $('#mute-mic-icon').toggleClass('d-none');
        $(this).find('i').toggleClass('fa-microphone').toggleClass('fa-microphone-slash');
        if ($(this).find('i').hasClass('fa-microphone')) {
            unmuteAudio();
        } else {
            muteAudio();
        }
    });

    // mute camera
    $('.utils .novideo').on('click', function () {
        $('#mute-cam-icon').toggleClass('d-none');
        $(this).find('i').toggleClass('fa-video').toggleClass('fa-video-slash');
        if ($(this).find('i').hasClass('fa-video')) {
            unmuteVideo();
        } else {
            muteVideo();
        }
    });

    // handle mute mic or mute camera from localStorage
    if (localStorage.getItem('micAllowed') == 'true') {
        $('.utils .audio').trigger('click');
    }
    if (localStorage.getItem('camAllowed') == 'true') {
        $('.utils .novideo').trigger('click');
    }

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
    $(document).on('click', '#invite', function () {
        Swal.fire({
            title: "Enter username to invite",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Invite",
            showLoaderOnConfirm: true,
            preConfirm: async (userInvited) => {
                try {
                    const response = await fetch('/api/invite', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            roomName,
                            userInvited
                        })
                    });
                    if (!response.ok) {
                        return Swal.showValidationMessage(response.statusText);
                    }
                    return response.json();
                } catch (error) {
                    console.log(`🚀 error`, error);
                    Swal.showValidationMessage(`Error to invite ${userInvited}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            console.log(`🚀 🚀 file: room-call.js:162 🚀 result`, result);
            if (result.isConfirmed) {
                if (!result.value.error) {
                    Swal.fire({
                        title: `Invite <b>${result.value.userInvited}</b> successfully!`,
                        imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${result.value.inviteLink}`,
                        html: `<span data-id="${result.value.inviteLink}" class="invite-link px-3 py-2 rounded bg-light text-black pointer user-select-none">${result.value.inviteLink}</span>`,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: result.value.message,
                    });
                }
            }
        });
    });
});
