document.getElementById("create-server").addEventListener("submit", create)

async function create(e){
    e.preventDefault()

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