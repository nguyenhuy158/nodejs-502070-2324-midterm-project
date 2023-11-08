/* eslint-disable no-undef */
function assignEditEvent() {
    const editButton = $(".btn-edit");
    const editModal = $("#modal-product-edit");
    const editForm = $("#edit-product");
    const editModalTitle = $("#modal-product-edit .modal-title");
    const editConfirmModalBody = $("#modal-product-edit .modal-body");
    const editConfirmSaveButton = $("#modal-product-edit .btn.btn-success");

    editButton.off('click').on("click", function () {
        const productName = $(this).parent().siblings()[2].textContent;
        const productId = $(this).parents()[1].id;

        editModalTitle.text(`Edit ${productName}`);
        $.ajax({
            url: `/api/products/${productId}`,
            type: "GET",
            success: function (data) {

                editForm.find("input[name=\"productName\"]")
                    .val(data.productName);

                editForm.find("input[name=\"importPrice\"]")
                    .val(data.importPrice);

                editForm.find("input[name=\"retailPrice\"]")
                    .val(data.retailPrice);

                editForm.find("textarea[name=\"desc\"]")
                    .val(data.desc);

                editModal.modal("show");
            },
            error: function (error) {
                console.log("Error:", error);
                showToast("error", error);
            }
        });

        editForm.off('submit').on("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            $.ajax({
                url: `/api/products/${productId}`,
                type: "PUT",
                data: formDataToJson(formData),
                success: function (data) {
                    showToast("success", 'Updated successfully');
                    reloadTable();
                    editModal.modal("hide");
                },
                error: function (error) {
                    console.log("Error:", error);
                    showToast("success", error);
                }
            });
        });
    });
}

function assignDeleteEvent() {
    const deleteButtons = $(".delete-btn");
    const modalTitle = $("#modalDelete .modal-title");
    const confirmModalBody = $("#modalDelete .modal-body");
    const confirmDeleteButton = $("#modalDelete .btn.btn-danger");
    deleteButtons.on('click', function () {
        const productName = $(this).parent().siblings()[2].textContent;
        const productId = $(this).parents()[1].id;

        confirmModalBody.html(`Are you sure you want to delete <strong>${productName}</strong>?`);

        $("#modalDelete")
            .modal("show");

        confirmDeleteButton.off('click').on('click', function () {
            $("#modalDelete").modal("hide");

            console.log(`/products/${productId}`);
            $.ajax(
                {
                    url: `/api/products/${productId}`,
                    type: 'DELETE',
                    success: (data) => {
                        showToast("success", 'Deleted successfully');
                        reloadTable();
                    },
                    error: (error) => {
                        showToast("error", "Delete fail! please try again!");
                    }
                }
            );
        });
    });
}
