/* eslint-disable no-undef */
function assignEditEvent() {

}

function handleLockUnlock(button, isLock) {
    const confirmModalBody = $("#modalDelete .modal-body");
    const confirmButton = $("#modalDelete .btn.btn-submit");
    const modalTitle = $("#modalDelete .modal-title");

    button.off('click').on('click', function () {

        const fullname = $(this).parent().siblings()[2].textContent;
        const userId = $(this).parents()[1].id;

        const action = isLock ? "lock" : "unlock";

        modalTitle.text("Lock/Unlock confirm");

        confirmButton.text("Lock/Unlock");

        confirmModalBody.html(`Are you sure you want to ${action} the account for <strong>${fullname}</strong>?`);
        $('#modalDelete').modal('show');

        confirmButton.off('click').on('click', function () {
            $('#modalDelete').modal('hide');
            $.ajax({
                url: `/api/users/${userId}/${action}`,
                type: 'PUT',
                success: (response) => {
                    console.log(`🚀 ------------------------------------------------------🚀`);
                    console.log(`🚀 🚀 file: 🚀 response`, response);
                    console.log(`🚀 ------------------------------------------------------🚀`);
                    toastr.success(response.message);
                    reloadTable();
                },
                error: (error) => {
                    console.log(`🚀 ------------------------------------------------🚀`);
                    console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
                    console.log(`🚀 ------------------------------------------------🚀`);
                    toastr.error(error.responseJSON?.message);
                }
            });
        });
    });
}

function assignLockEvent() {
    const lockButtons = $(".lock-btn");
    handleLockUnlock(lockButtons, true);
}

function assignUnLockEvent() {
    const unlockButtons = $(".unlock-btn");
    handleLockUnlock(unlockButtons, false);
}

function assignResentEmailEvent() {
    const resentButtons = $(".resent-btn");
    const modalTitle = $("#modalDelete .modal-title");
    const confirmModalBody = $("#modalDelete .modal-body");
    const confirmButton = $("#modalDelete .btn.btn-submit");

    // confirmButton.removeClass('btn-danger').addClass('btn-secondary');
    confirmButton.text("Resent");

    resentButtons.off('click').on('click', function () {
        const fullname = $(this).parent().siblings()[2].textContent;
        const userId = $(this).parents()[1].id;

        modalTitle.text('Resent email confirm');
        confirmButton.text('Resent');
        confirmModalBody.html(`Are you sure you want to resent email to: <strong>${fullname}</strong>?`);

        $('#modalDelete').modal('show');

        confirmButton.off('click').on('click', function () {
            $('#modalDelete').modal('hide');

            $.ajax({
                url: `/api/users/resent/${userId}`,
                type: 'GET',
                success: (response) => {
                    console.log(`🚀 ------------------------------------------------------🚀`);
                    console.log(`🚀 🚀 file: 🚀 response`, response);
                    console.log(`🚀 ------------------------------------------------------🚀`);
                    toastr.success(response.message);
                    reloadTable();
                },
                error: (error) => {
                    console.log(`🚀 ------------------------------------------------🚀`);
                    console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
                    console.log(`🚀 ------------------------------------------------🚀`);
                    toastr.error(error.responseJSON?.message);
                }
            });
        });
    });
}

function assignDeleteEvent() {
    const deleteButtons = $(".delete-btn");
    const modalTitle = $("#modalDelete .modal-title");
    const confirmModalBody = $("#modalDelete .modal-body");
    const confirmButton = $("#modalDelete .btn.btn-submit");

    deleteButtons.off('click').on('click', function () {
        const fullname = $(this).parent().siblings()[2].textContent;
        const userId = $(this).parents()[1].id;

        console.log(`🚀 🚀 file: confirm-user.js:17 🚀 userId`, userId);
        console.log(`🚀 🚀 file: confirm-user.js:13 🚀 fullname`, fullname);

        modalTitle.text('Delete confirm');
        confirmButton.text('Delete');

        confirmModalBody.html(`Are you sure you want to delete<strong>${fullname}</strong>?`);

        $('#modalDelete').modal('show');

        confirmButton.off('click').on('click', function () {
            $('#modalDelete').modal('hide');


            $.ajax({
                url: `/api/users/${userId}`,
                type: 'DELETE',
                success: (response) => {
                    console.log(`🚀 ------------------------------------------------------🚀`);
                    console.log(`🚀 🚀 file: 🚀 response`, response);
                    console.log(`🚀 ------------------------------------------------------🚀`);
                    toastr.success(response.message);
                    reloadTable();
                },
                error: (error) => {
                    console.log(`🚀 ------------------------------------------------🚀`);
                    console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
                    console.log(`🚀 ------------------------------------------------🚀`);
                    toastr.error(error.responseJSON?.message);
                }
            });
        });
    });
}