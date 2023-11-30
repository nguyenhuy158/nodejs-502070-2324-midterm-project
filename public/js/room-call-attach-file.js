$(() => {
    $('#uploadButton').on('click', () => {
        $('#attach-file').trigger('click');
    });

    $('#attach-file').on('change', function () {
        const file = this.files[0];
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

        $('#attach-file').trigger('reset');
    });

    socket.on('file', (data) => {
        const { file, sender } = data;
        console.log('Received file:', file);

        displayMessage(file.data, sender, isImage = file.type.includes('image'));
    });
});