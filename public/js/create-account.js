/* eslint-disable no-undef */
$(() => {
    $('#create-account').on('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);

        $.ajax({
            url: '/api/users',
            type: 'POST',
            data: formDataToJson(formData),
            success: (response) => {
                console.log(`🚀 ------------------------------------------------------🚀`);
                console.log(`🚀 🚀 file: create-account.js:11 🚀 response`, response);
                console.log(`🚀 ------------------------------------------------------🚀`);
                showToast('success', response.message);
                this.reset();
            },
            error: (error) => {
                console.log(`🚀 ------------------------------------------------🚀`);
                console.log(`🚀 🚀 file: create-account.js:12 🚀 error`, error.responseJSON);
                console.log(`🚀 ------------------------------------------------🚀`);
                showToast('error', error.responseJSON?.message);
            }
        });
    });
});
