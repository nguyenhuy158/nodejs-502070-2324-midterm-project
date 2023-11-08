/* eslint-disable no-undef */
const changeMode = (isChecked) => {
    isChecked ? $('#theme-toggle').click() : '';
};

function getSetting() {
    $.ajax({
        url: `/api/setting`,
        method: "GET",
        success: function (data) {
            console.log("Settings updated:", data.darkMode);
            changeMode(data.darkMode);
        },
        error: function (error) {
            console.error("Error updating settings:", error);
            changeMode(false);
        }
    });
}

function postSetting(darkMode) {
    $.ajax({
        url: `/api/setting`,
        method: "POST",
        data: { darkMode: darkMode },
        success: function (data) {
            console.log("Settings updated:", data);
            return true;
        },
        error: function (error) {
            console.error("Error updating settings:", error);
            return false;
        }
    });
}

$(() => {
    const btnDarkMode = $("#theme-toggle");

    getSetting();

    btnDarkMode
        .on('change', function () {
            changeMode(this.checked);
            postSetting(this.checked);
        });
});

