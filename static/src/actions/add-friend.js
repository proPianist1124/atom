import { fetch_api } from "/src/misc/fetch.js"

document.getElementById("add-friend").addEventListener("submit", async (e) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    const res = await fetch_api("/api/add-friend", { friend: document.getElementById("friend-username").value })

    if (res.error) {
        document.getElementById("message").style.color = "var(--danger)"
        document.getElementById("message").innerText = res.error
    } else {
        document.getElementById("message").style.color = "var(--success)"
        document.getElementById("message").innerText = res.success
    }
})