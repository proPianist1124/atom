import { fetch_api } from "/src/misc/fetch.js"

document.getElementById("leave").addEventListener("click", async () => {
    const res = await fetch_api("/api/leave-server", { id: document.getElementById("id").value })

    if (res.success) {
        window.location.href = "/home"
    } else {
        alert(res.error)
    }
})