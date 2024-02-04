import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js"

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

socket.on("msg", (msg) => {
    const div = document.createElement("div")
    div.setAttribute("class", "message")
    
    const span = document.createElement("span")
    span.innerText = msg.split("&&")[1]

    div.innerText = `${msg.split("&&")[0]}: `
    div.appendChild(span)

    document.getElementById("feed").appendChild(div)
    document.getElementById("feed").scrollTop = document.getElementById("feed").scrollHeight
})

socket.on("user-connection", (arg) => {
    const p = document.createElement("p")
    p.innerHTML = `<span style = "color:var(--${arg == "a user has connected" ? "success" : "danger"})">${arg}</span>`
    document.getElementById("feed").appendChild(p)
})

document.getElementById("send").addEventListener("click", send_message)

function send_message(){
    const user = JSON.parse(getCookie("session"))

    if(document.getElementById("message").value == ""){
        document.getElementById("error").innerText = "Please write a message first!"
    }else if(getCookie("session") == ""){
        window.location.href = "/"
    }else{
        document.getElementById("error").innerText = ""
        socket.emit("msg", `${user.id}&&${document.getElementById("message").value}`)
        document.getElementById("message").value = ""
    }
}

let keys = {
    shift: false,
    enter: false
}

addEventListener("keydown", (event) => {
    if(event.key == "Shift"){
      keys.shift = true
    }
    if(event.key == "Enter") {
      keys.enter = true
    }

    if(keys.shift && keys.enter){
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