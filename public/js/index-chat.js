//Content Loaded
window.addEventListener("DOMContentLoaded", (e) => {
    // var header = document.querySelector(".header");
    // var chatRoom = document.querySelector(".chat-room");
    // var typeArea = document.querySelector(".type-area");
    var btnAdd = document.querySelector(".button-add");
    var others = document.querySelector(".others");
    var emojiBox = document.querySelector(".emoji-button .emoji-box");
    var emojiButton = document.querySelector(".others .emoji-button");
    var emojis = document.querySelectorAll(".emoji-box span");
    var inputText = document.querySelector("#inputText");
    var btnSend = document.querySelector(".button-send");
    var messageArea = document.querySelector(".message.message-right");

    //Button Add onclick event
    btnAdd.addEventListener("click", (e) => {
        others.classList.add("others-show");
    });
    //Emoji onclick event
    emojiButton.addEventListener("click", (e) => {
        emojiBox.classList.add("emoji-show");
    });
    //Button Send onclick event
    btnSend.addEventListener("click", (e) => {
        var mess = inputText.value;
        var bubble = document.createElement('div');
        bubble.className += " bubble bubble-dark";
        bubble.textContent = mess;
        messageArea.appendChild(bubble);
        inputText.value = "";
    });
    for (var emoji of emojis) {
        emoji.addEventListener("click", (e) => {
            e.stopPropagation();
            emojiBox.classList.remove("emoji-show");
            others.classList.remove("others-show");
            inputText.value += e.target.textContent;
        });
    }
});


// TODO 1: The chat form can't get the message of the input
// TODO 2: When click Other button, can't turn off by clicking it again. Button Emoji also have the same error 
