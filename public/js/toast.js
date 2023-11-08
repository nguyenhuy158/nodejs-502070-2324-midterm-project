/* eslint-disable no-undef */
function showToast(type, message) {
    const toast = $(`
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas fa-info-circle mr-2"></i>
                <strong class="me-auto">Notification</strong>
                     <small class="text-muted">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</small> 
                     <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> 
            </div>
            <div class="toast-body ${type === "error" ? "text-danger" : "text-success"}">
                ${message}
            </div>
        </div>
    `);

    $(".toast-container")
        .append(toast);

    const toastInstance = new bootstrap.Toast(toast[0], {
        autohide: true,
        delay: 1000
    });

    console.log("=>(index.hbs:377) toastInstance", toastInstance);

    toastInstance.show();

    $(toastInstance)
        .on("hidden.bs.toast", function () {
            toast.remove();
        });
}
