document.getElementById("login").addEventListener("submit",submit)
async function submit(e){
    e.preventDefault()
    let res = await fetch(`/${document.getElementById("type").value}`, {
        headers: {
            "Content-Type":"application/json"
        },
        method: "POST",
        body: JSON.stringify({ alias:document.getElementById("alias").value, password:document.getElementById("password").value})
    })
    res = await res.json()

    if (res.error) {
        document.getElementById("error").innerText = res.error
    } else {
        function createCookie(name, value, minutes) {
            if (minutes) {
                let date = new Date()
                date.setTime(date.getTime() + (minutes * 60 * 1000))
                var expires = `expires=${date.toGMTString()}`
            } else {
                var expires = ""
            }
            document.cookie = `${name}=${value}; ${expires}; path=/`
        }

        createCookie("session", JSON.stringify(res), 10)

        document.getElementById("error").innerText = ""
        window.location.href = "/"
    }
}