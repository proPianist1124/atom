import { io } from "/src/socket-io.js"

function getCookie(cname) {
    let name = `${cname}=`
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == " ") {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

const socket = io()
const user = JSON.parse(getCookie("session"))

// listen for messages from the server
socket.on(`msg_${document.getElementById("id").value}`, (msg) => {
    const div = document.createElement("div")
    div.setAttribute("class", "card-secondary")
    
    const span = document.createElement("span")
    span.innerText = msg.text

    div.innerText = `${msg.author}: `
    div.appendChild(span)

    document.getElementById("feed").appendChild(div)
    document.getElementById("feed").scrollTop = document.getElementById("feed").scrollHeight
})

// send a message to the server
document.getElementById("send").addEventListener("click", send_message)

function send_message() {
    if (document.getElementById("message").value == "") {
        document.getElementById("error").innerText = "Please write a message first!"
    } else if(getCookie("session") == "") {
        window.location.href = "/"
    } else {
        document.getElementById("error").innerText = ""
        
        socket.emit("msg", { server: document.getElementById("id").value, author: user.id, text: document.getElementById("message").value })

        document.getElementById("message").value = ""
    }
}

let keys = {
    shift: false,
    enter: false
}

addEventListener("keydown", (event) => {
    if (event.key == "Shift") {
      keys.shift = true
    }
    if (event.key == "Enter") {
      keys.enter = true
    }

    if (keys.shift && keys.enter) {
        send_message()
    }
})
addEventListener("keyup", (event) => {
    if (event.key == "Shift") {
      keys.shift = false
    }
    if (event.key == "Enter") {
      keys.enter = false
    }
})