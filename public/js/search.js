/* eslint-disable no-undef */
const searchContainer = $("#search-container");
const searchInput = $("#search-input");
const searchResults = $("#search-results");

["click", "input"].forEach((evt) => {
    searchInput.on(evt, function () {
        const searchTerm = searchInput.val();
        performSearch(searchTerm);
    });
});

$(document)
    .on("click", function (e) {
        if (!searchInput.is(e.target) && !searchResults.is(e.target)) {
            searchResults.css("display", "none");
        }
    });

function performSearch(searchTerm) {
    const results = ["Result 1", "Result 2", "Result 3"];
    fetch(`/search?q=${searchTerm}`, {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("=>(search.js:40) data", data);
            searchResults.empty();
            let displayedResults = 5;
            let totalResults = 0;
            totalResults = data.results.length;
            const resultsToDisplay = data.results.slice(0, displayedResults);
            const loadMore = $(`<button class="btn btn-sm btn-outline-primary ms-auto d-block" onclick="$("#search-container").submit()">Load more...</button>`);
            resultsToDisplay.forEach((result) => {
                const resultItem = $(`<a class="dropdown-item d-flex align-items-center my-2"></a>`);
                resultItem.attr("href", result.hasOwnProperty("role") ? `/users/${result._id}` : `/products/${result._id}`);

                resultItem.append($(`<span class="text-truncate">${result.hasOwnProperty("role") ? result.fullName : result.productName}</span>`));

                const iconUser = $(`<span class="material-symbols-outlined"> account_circle </span>`);
                const iconProduct = $(`<span class="material-symbols-outlined"> smartphone </span>`);
                resultItem.prepend(result.hasOwnProperty("role") ? iconUser : iconProduct);

                searchResults.append(resultItem);
            });
            if (displayedResults < totalResults) {
                searchResults.append(loadMore);
            }
            searchResults.css("display", "block");
        });
}
