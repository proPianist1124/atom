document.getElementById("leave").addEventListener("click", leave)

async function leave() {
    let res = await fetch("/api/leave-server", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: document.getElementById("id").value
        })
    })
    res = await res.json()

    if (res.success) {
        window.location.href = "/home"
    } else {
        alert(res.error)
    }
}