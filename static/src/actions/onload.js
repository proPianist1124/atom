import { io } from "/src/misc/socket-io.js"
import { getCookie } from "/src/misc/cookies.js"

document.body.addEventListener("keyup", function(e) {
    if (e.key == "Escape") {
        window.location.href = "http://gg.gg/18uvk3"
    }
})

const socket = io()

socket.on("connect", () => {
    socket.emit("status", { status: "online", sid: getCookie("sid") ? getCookie("sid") : null })
})