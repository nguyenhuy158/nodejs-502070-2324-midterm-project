/* eslint-disable no-undef */
$(() => {
    // Assuming you have a form with id 'forget-password-form' and input field with id 'email'
    $('.forget-password-card').on('submit', function (e) {
        e.preventDefault();

        var email = $('input[name="email"]').val();

        $.ajax({
            url: '/forget-password',  // replace with your actual forget password endpoint
            type: 'POST',
            data: {
                email: email
            },
            success: function (response) {
                console.log(`🚀 response`, response);
                console.log(`🚀 response.message`, response.message);
                if (!response.error) {
                    e.target.reset();
                }
                if (response.error) {
                    // Display error toast
                    toastr.error(response.message);
                } else {
                    // Display success toast
                    toastr.success(response.message);
                }
            },
            error: function (jqXHR, textStatus, error) {
                // Display error toast
                toastr.error(error.responseJSON?.message);
            }
        });
    });
});