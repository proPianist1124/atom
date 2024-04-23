document.getElementById("create-button").addEventListener("click", create)

async function create(){
    let res = await fetch("/api/create-server", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: document.getElementById("server-name").value
        })
    })
    res = await res.json()

    if (res.error) {
        document.getElementById("error").innerText = res.error
    } else {
        window.location.href = `/server/${res.id}`
    }
}