/* eslint-disable no-undef */
$(() => {
    let table = $("#product-table")
        .DataTable({
            colReorder: {
                realtime: false
            },
            autoFill: false,
            buttons: [
                {
                    text: 'Add product',
                    action: function (e, dt, node, config) {
                        window.location = '/products/add';
                    }
                },
                {
                    text: 'Reload',
                    action: function (e, dt, node, config) {
                        dt.ajax.reload();
                    }
                },
                'spacer',
                {
                    extend: 'collection',
                    className: 'custom-html-collection',
                    buttons: [
                        '<h3>Export</h3>',
                        'copy',
                        'pdf',
                        'csv',
                        'excel',
                        'print',
                        '<h3 class="not-top-heading">Column Visibility</h3>',
                        'columnsToggle'
                    ]
                },
            ],
            dom: "B<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            responsive: {
                details: {
                    type: 'inline'
                }
            },
            rowId: '_id',
            search: {
                caseInsensitive: false,
                regex: true
            },
            language: {
                zeroRecords: "No records to display",
                emptyTable: "No data available in table",
                decimal: '.',
                thousands: ','
            },
            retrieve: true,
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
            stateSave: true,
            scrollX: true,
            scrollY: "50vh",
            scrollCollapse: true,
            fixedHeader: true,
            order: [[0, 'asc']],
            processing: true,
            autoWidth: true,
            //- deferRender: true,
            //- scroller: true,
            ajax: {
                url: '/api/products',
                dataSrc: ''
            },
            columnDefs: [
                {
                    targets: [1, 2, 3, 4, 5, 6],
                    render: DataTable.render.hyperLink('Download', 'popup', 1000, 500)
                }
            ],
            columns: [
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    },
                    orderable: false
                },
                { data: 'barcode' },
                {
                    data: 'productName',
                    render: function (data, type, row) {
                        return `<a href="/products/${row._id}">${DataTable.render.ellipsis(20, true)(data, type, row)}</a>`;
                    }
                },
                {
                    data: 'importPrice',
                    render: function (data, type, row) {
                        const number = parseInt(data, 10);
                        return number.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        });
                    }
                },
                {
                    data: 'retailPrice',
                    render: function (data, type, row) {
                        const number = parseInt(data, 10);
                        return number.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        });
                    }
                },
                { data: 'category.name' },
                {
                    data: 'imageUrls',
                    render: function (data, type, row) {
                        return `<a class="image-popup d-block" href=${data[0]} title="${row.productName}">
                        <img class="lazy" width="100" height="100" data-src="${data[0]}"/>
                        </a>`;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        const viewBtn = `<a class="my-1 btn btn-sm btn-primary" href="/products/${row._id}">
                            <i class='bx bx-detail'></i>
                        </a>`;
                        const updateBtn = `<button class="my-1 btn btn-sm btn-success btn-edit">
                            <i class='bx bx-edit'></i>
                        </button>`;
                        const deleteBtn = `<button class="my-1 btn btn-sm btn-danger delete-btn">
                            <i class='bx bx-trash-alt'></i>
                        </button>`;
                        const demo = ``;


                        return `${viewBtn} ${updateBtn} ${deleteBtn} ${demo}`;
                    }
                },
            ]
        });
    table.on('draw.dt', function () {
        var info = table.page.info();
        table.column(0, { search: 'applied' })
            .nodes()
            .each(function (cell, i) {
                cell.innerHTML = i + 1 + info.start;
            });

        lazyImageLoading();
        magnificPopup();
        assignDeleteEvent();
        assignEditEvent();
    });

    table.buttons().container().appendTo($('#button-container'));

    $("#product-table")
        .DataTable({
            retrieve: true,
            stateSave: true,
            stateSaveCallback: function (settings, data) {
                localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
            },
            stateLoadCallback: function (settings) {
                return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance));
            }
        });

    $('#reload-product-table').on('click', () => {
        $('#product-table').DataTable().ajax.reload(function (json) {
            console.log("The data has been refreshed:", json);
        });
    });
});