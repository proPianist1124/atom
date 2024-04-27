import { fetch_api } from "/src/misc/fetch.js"

document.getElementById("leave").addEventListener("click", leave)

async function leave() {
    let res = await fetch_api("/api/leave-server", { id: document.getElementById("id").value })

    if (res.success) {
        window.location.href = "/home"
    } else {
        alert(res.error)
    }
}