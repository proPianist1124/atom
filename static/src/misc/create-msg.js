import { getCookie } from "/src/misc/cookies.js"

export function create_msg(msg) {
    // author
    const author = document.createElement("span")
    author.setAttribute("style", `display: block; margin-bottom: 7px; font-size: 14.5px; ${msg.author == getCookie("alias") ? "text-align: right; color: #fff;" : "color: var(--secondary);"}`)
    author.innerText = msg.author == getCookie("alias") ? "me" : msg.author

    // message box
    const div = document.createElement("div")
    div.setAttribute("class", "message")
    div.setAttribute("style", `margin-bottom: 20px; ${msg.author == getCookie("alias") ? "background-color: var(--primary); border-color: var(--primary-darker); margin-left: auto;" : "color: var(--secondary);"}`)
    
    const span = document.createElement("span")
    span.innerText = msg.text

    div.appendChild(span)

    document.getElementById("feed").appendChild(author)
    document.getElementById("feed").appendChild(div)
    document.getElementById("feed").scrollTop = document.getElementById("feed").scrollHeight
}