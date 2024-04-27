import { fetch_api } from "/src/misc/fetch.js"

document.getElementById("create-server").addEventListener("submit", create)

async function create(e){
    e.preventDefault()
    e.stopImmediatePropagation()

    let res = await fetch_api("/api/create-server", { name: document.getElementById("server-name").value })

    if (res.error) {
        document.getElementById("error").innerText = res.error
    } else {
        window.location.href = `/server/${res.id}`
    }
}