import { io } from "/src/socket-io.js"
import { create_msg } from "/src/misc/create-msg.js"
import { getCookie } from "/src/misc/cookies.js"

const socket = io()

// listen for messages from the server
socket.on(`msg_${document.getElementById("id").value}`, (msg) => {
    create_msg(msg)
})

// send a message to the server
document.getElementById("send-msg").addEventListener("submit", send_message)

function send_message(e) {
    e.preventDefault()
    e.stopImmediatePropagation()
  
    if (document.getElementById("message").value == "") {
        document.getElementById("error").innerText = "Please write a message first!"
    } else {
        document.getElementById("error").innerText = ""
        
        socket.emit("msg", { server: document.getElementById("id").value, author: getCookie("sid"), text: document.getElementById("message").value })

        document.getElementById("message").value = ""
    }
}