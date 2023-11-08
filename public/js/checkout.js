/* eslint-disable no-undef */

function computeTotalBill(cart) {
    let totalBill = 0;

    if (cart && cart.products && Array.isArray(cart.products)) {
        for (const productItem of cart.products) {
            if (productItem.product && typeof productItem.quantity === 'number') {
                totalBill += productItem.product.retailPrice * productItem.quantity;
            }
        }
    }

    return totalBill;
}

function loadInfoCart() {
    $.ajax({
        url: `/api/carts/current`,
        type: 'GET',
        success: (response) => {
            console.log(`🚀 🚀 file: 🚀 response`, response.cart);
            showToast('success', response.message);

            if (response.cart?.products) {
                response.cart?.products.forEach(p => {
                    console.log(`🚀 🚀 file: checkout.js:26 🚀 p`, p);
                    const productData = {
                        imageUrl: p.product.imageUrls[0],
                        name: p.product.productName,
                        quantity: p.quantity,
                        price: p.product.retailPrice,
                    };
                    $('#products-container').text('').createProductCardAndAppend(productData);
                });

                $('#total-money').text(computeTotalBill(response.cart));
            }
        },
        error: (error) => {
            console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
            showToast('error', error.responseJSON?.message);
        }
    });
}

function loadInfoCustomer() {
    const phone = $('#phone-number').val();

    const validPhoneNumberPattern = /^0\d{9}$/;

    if (!validPhoneNumberPattern.test(phone)) {
        showToast('error', 'Invalid phone number format');
        return;
    }

    $.ajax({
        url: `/api/customers/${phone}`,
        method: 'GET',
        success: function (response) {
            const customer = response.customer;

            if (customer) {
                showToast('success', response.message);

                $(`input[name="fullName"]`).val(customer.fullName);
                $(`input[name="address"]`).val(customer.address);
            } else {
                showToast('error', response.message);
            }
        },
        error: function (error) {
            showToast('error', error.responseJSON?.message);
        }
    });
}


$(() => {

    $('.btn-checkout').on('click', function () {
        $.ajax({
            url: `/checkout`,
            type: 'POST',
            data: {
                phone: $('#phone-number').val(),
                givenAmount: $('#given-money').text()
            },
            success: (response) => {
                console.log(`🚀 🚀 file: 🚀 response`, response);
                showToast('success', response.message);
            },
            error: (error) => {
                console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
                showToast('error', error.responseJSON?.message);
            }
        });
    });

    $('#input-given-money').on('input', function () {
        const total = parseFloat($('#total-money').text());
        const given = parseFloat($(this).val());

        if (isNaN(given)) {
            $('#given-money').text('');
            $('#exchange-money').text('');
            $('.btn-checkout').prop('disabled', true);
        } else {
            const exchange = given - total;
            $('#given-money').text(given);
            $('#exchange-money').text(exchange >= 0 ? exchange : 0);

            $('.btn-checkout').prop('disabled', exchange < 0);
        }
    });

    $('#load-product').on('click', function () {
        loadInfoCart();
    });
    loadInfoCart();




    $('#phone-number').on('blur', function () {
        loadInfoCustomer();
    });

    $('#load-customer').on('click', function () {
        loadInfoCustomer();
    });

    $('#regions').select2({
        dropdownAutoWidth: true,
        delay: 250,
        debug: true,
        width: "100%",
        placeholder: 'Select an regions',
        ajax: {
            url: '/search/address',
            dataType: 'json',
            data: function (params) {
                const query = {
                    q: params.term,
                    type: 'regions'
                };
                console.log(`🚀 🚀 file: checkout.js:16 🚀 query`, query);
                return query;
            },
            sorter: function (e) {
                console.log(`🚀 🚀 file: checkout.js:20 🚀 sorter`, e);
            },
            processResults: function (data) {
                const names = data.map((p) => {
                    return {
                        "id": p.codename,
                        "text": p.name
                    };
                });

                return {
                    results: names
                };
            },
            cache: true
        }
    });

    $('#districts').select2({
        disabled: true,
        placeholder: 'Select an regions',
        ajax: {
            delay: 250,
            url: '/search/address',
            dataType: 'json',
            data: function (params) {
                const query = {
                    q: params.term,
                    type: 'districts',
                    regioncode: $('#regions').val()
                };
                console.log(`🚀 🚀 file: checkout.js:52 🚀 query`, query);
                return query;
            },
            processResults: function (data) {

                const names = data
                    .map((p) => {
                        return {
                            "id": p.codename,
                            "text": p.name
                        };
                    });


                return {
                    results: names
                };
            },
            cache: true
        }
    });

    $('#wards').select2({
        disabled: true,
        placeholder: 'Select an regions',
        ajax: {
            delay: 250,
            url: '/search/address',
            dataType: 'json',
            data: function (params) {
                const query = {
                    q: params.term,
                    type: 'wards',
                    regioncode: $('#regions').val(),
                    districtcode: $('#districts').val()
                };
                return query;
            },
            processResults: function (data) {

                const names = data.map((p) => {
                    return {
                        "id": p.codename,
                        "text": p.name
                    };
                });

                return {
                    results: names
                };
            },
            cache: true
        }
    });

    $('#regions').on('change', function () {
        $("#districts").prop("disabled", $('#regions').val() === '');
    });
    $('#districts').on('change', function () {
        $("#wards").prop("disabled", $('#districts').val() === '');
    });
});

(function ($) {
    $.fn.createProductCardAndAppend = function (productData) {
        const productCard = $('<div class="product-card">');
        const card = $('<div class="card">');
        const imgBox = $('<div class="img-box">');
        const productImg = $('<img class="product-img">')
            .attr('src', productData.imageUrl)
            .attr('alt', productData.name)
            .attr('width', '80');
        const detail = $('<div class="detail">');
        const productName = $('<h4 class="product-name">').text(productData.name);
        const wrapper = $('<div class="wrapper">');
        const productQty = $('<div class="product-qty">');
        const decrementBtn = $('<button id="decrement">')
            .append($('<ion-icon name="remove-outline">'));
        const quantity = $('<span id="quantity">').text(productData.quantity);
        const incrementBtn = $('<button id="increment">')
            .append($('<ion-icon name="add-outline">'));
        const price = $('<div class="price">');
        const priceValue = $('<span id="price">')
            .text(productData.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }));


        const closeBtn = $('<button class="product-close-btn">')
            .append($('<ion-icon name="close-outline">'));

        productCard.append(card);
        card.append(imgBox);
        imgBox.append(productImg);
        card.append(detail);
        detail.append(productName);
        detail.append(wrapper);
        wrapper.append(productQty);
        productQty.append(decrementBtn);
        productQty.append(quantity);
        productQty.append(incrementBtn);
        wrapper.append(price);
        price.append(priceValue);
        card.append(closeBtn);

        return this.append(productCard);
    };
})(jQuery);
// const productData = {
//     imageUrl: 'https://images.macrumors.com/t/TkNh1oQ0-9TnnBjDnLyuz6yLkjE=/1600x0/article-new/2023/09/iPhone-15-General-Feature-Black.jpg',
//     name: 'Iphone 15 Pro',
//     quantity: 1,
//     price: 1.25,
// };
// $('#products-container').createProductCardAndAppend(productData);

