document.getElementById("login").addEventListener("submit", submit)

async function submit(e){
    e.preventDefault()

    document.getElementById("auth-button").innerText = document.getElementById("type").value == "login" ? "Logging in..." : "Signing up..."

    let res = await fetch(`/api/${document.getElementById("type").value}`, {
        headers: {
            "Content-Type":"application/json"
        },
        method: "POST",
        body: JSON.stringify({
            alias: document.getElementById("alias").value,
            password:document.getElementById("password").value,
            invite_key: document.getElementById("invite_key") ? document.getElementById("invite_key").value : null
         })
    })
    res = await res.json()

    if (res.error) {
        document.getElementById("error").innerText = res.error
        document.getElementById("auth-button").innerText = document.getElementById("type").value == "login" ? "Login" : "Sign Up"
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
        window.location.href = "/home"
    }
}