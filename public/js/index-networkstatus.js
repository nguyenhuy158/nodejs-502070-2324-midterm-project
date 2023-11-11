/* eslint-disable no-undef */
$(() => {
    // handle offline event
    function updateOnlineStatus() {
        if (navigator.onLine) {
            $('#offlineMessage').hide();
            $('#content').show();
        } else {
            $('#offlineMessage').show();
            $('#content').hide();
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();
});