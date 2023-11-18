/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
$(() => {
    const notification = sessionStorage.getItem('notification');
    const notificationType = sessionStorage.getItem('notificationType');

    if (notification) {
        if (notificationType === 'success') {
            toastr.success(notification);
        } else if (notificationType === 'error') {
            toastr.error(notification);
        }

        sessionStorage.removeItem('notification');
        sessionStorage.removeItem('notificationType');
    }
});

function createAndShowSpinner() {
    const opts = {
        speed: 3,
        animation: 'spinner-line-shrink',
        fadeColor: 'transparent',
        shadow: '0 0 1px transparent',
        zIndex: 2000000000,
    };

    const Spinner = window.Spin.Spinner;
    const target = document.getElementsByTagName('body')[0];
    const spinner = new Spinner(opts).spin(target);

    return spinner;
}

setTimeout(() => {
    $('.toast').each((index, value) => {
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(value);
        toastBootstrap.show();
    });
}, 1000);