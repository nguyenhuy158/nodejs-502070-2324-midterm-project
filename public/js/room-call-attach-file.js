$(() => {
    $('#uploadButton').on('click', () => {
        $('#attach-file').trigger('click');
    });

    $('#attach-file').on('change', function () {
        const file = this.files[0];
        console.log(`🚀 🚀 file: room-call-attach-file.js:8 🚀 file`, file);

        if (file.size <= 10 * 1024 * 1024) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const data = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: event.target.result,
                };

                socket.emit('file', { file: data, roomId });
            };
            reader.readAsDataURL(file);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'File Size Exceeds Limit',
                text: 'The selected file size exceeds the limit of 10MB.',
                confirmButtonText: 'OK',
            });
        }
        $('#attach-file').trigger('reset');
    });


    socket.on('file', (data) => {
        const {
            file: fileRecived,
            sender,
            isSender } = data;
        console.log('Received file:', fileRecived);

        displayMessage('', sender, undefined, isSender, fileRecived);
    });
});