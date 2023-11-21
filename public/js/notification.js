/* eslint-disable no-undef */
$(() => {
    async function fetchData() {
        // try {
        //     const response = await fetch('https://api.example.com/data');
        //     const data = await response.json();
        //     return data;
        // } catch (error) {
        //     console.error('Error fetching data:', error);
        //     return error;
        // }
        return {
            items: [
                { name: 1 },
                { name: 1 },
                { name: 1 },
            ],
        };
    }

    async function showData() {
        try {
            const data = await fetchData();

            const htmlContent = `
                <div>
                <ul class="list-group">
                    ${data.items.map(item => `<a style="outline: none;" href="${data.items.inviteLink || '/'}" class="text-start list-group-item">${item.name}</a>`).join('')}
                    </ul>
                    </div>
                `;

            Swal.fire({
                title: "<strong>Notification</strong>",
                icon: "info",
                html: htmlContent,
                focusConfirm: false,
                confirmButtonText: 'Close!',
                confirmButtonAriaLabel: "Thumbs up, great!",
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to fetch data from the API.',
            });
        }
    }

    $('#notification').on('click', function () {
        showData();
    });
});
