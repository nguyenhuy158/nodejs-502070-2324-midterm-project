/* eslint-disable no-undef */
$(() => {
    $('.add-product-to-cart').on('click', function () {

        const productId = $(this).parent().find('input[type="hidden"][name="_id"]').val();

        $.ajax({
            url: `/api/products/add-cart/${productId}`,
            type: 'PUT',
            success: (response) => {
                console.log(`🚀 ------------------------------------------------------🚀`);
                console.log(`🚀 🚀 file: 🚀 response`, response);
                console.log(`🚀 ------------------------------------------------------🚀`);
                showToast('success', response.message);
            },
            error: (error) => {
                console.log(`🚀 ------------------------------------------------🚀`);
                console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
                console.log(`🚀 ------------------------------------------------🚀`);
                showToast('error', error.responseJSON?.message);
            }
        });
    });

});