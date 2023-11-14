/* eslint-disable no-undef */
$(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        // Send a POST request to the server
        $.ajax({
            url: `/email-confirm?token=${token}`,
            type: 'POST',
            success: function (response) {
                if (response.error) {
                    // Store the message in session storage
                    sessionStorage.setItem('notification', response.message);
                    // Redirect to /login
                    window.location.href = '/login';
                } else {
                    // Store the message in session storage
                    sessionStorage.setItem('notification', response.message);
                    // Redirect to /
                    window.location.href = '/';
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Store the error message in session storage
                sessionStorage.setItem('notification', errorThrown.responseJSON?.message);
                // Redirect to /login
                window.location.href = '/login';
            }
        });
    }
});