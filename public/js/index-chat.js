/* eslint-disable no-undef */
// video call funciton

// TODO: can not display video call


// Chat form function 
$(document).ready(function () {
    // Chat form function
    var $btnAdd = $(".button-add");
    var $others = $(".others");
    var $emojiBox = $(".emoji-button .emoji-box");
    var $emojis = $(".emoji-box span");
    var $inputText = $("#inputText");
    var $btnSend = $(".button-send");
    var $messageArea = $(".message.message-right");

    // Button Add onclick event
    $btnAdd.click(function () {
        $others.toggleClass("others-show");
    });

    // Emoji onclick event
    $('#showIcons').click(function () {
        $('.icon-list').css('display', 'flex');
    });
    $('.icon').click(function () {
        const selectedIcon = $(this).data('icon');
        $('.icon-list').hide();
        $('#chatInput').val($('#chatInput').val() + selectedIcon);
    });

    // Button Send onclick event
    $btnSend.click(function () {
        var mess = $inputText.val();
        var $bubble = $("<div>").addClass("bubble bubble-dark").text(mess);
        $messageArea.append($bubble);
        $inputText.val("");
    });

    // Emojis onclick event
    $emojis.click(function (e) {
        e.stopPropagation();
        $emojiBox.removeClass("emoji-show");
        $others.removeClass("others-show");
        $inputText.val($inputText.val() + $(this).text());
    });

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

    // window.addEventListener('beforeunload', function (e) {
    //     var confirmationMessage = 'Are you sure you want to leave?';
    //     (e || window.event).returnValue = confirmationMessage;
    //     return confirmationMessage;
    // });

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
});



// TODO 2: When click Other button, can't turn off by clicking it again. Button Emoji also have the same error 
