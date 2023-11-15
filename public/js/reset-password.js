/* eslint-disable no-undef */
$(() => {

    $('form').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            url: '/reset-password',
            type: 'POST',
            data: {
                password: $('input[name="password"]').val(),
                passwordConfirmation: $('input[name="passwordConfirmation"]').val()
            },
            success: function (response) {
                if (response.error) {
                    toastr.error(response.message);
                } else {
                    toastr.success(response.message);
                    e.target.reset();
                    window.location.href = '/';
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toastr.error(jqXHR.responseJSON?.message);
            }
        });
    });
});