import { createCookie } from "/src/misc/cookies.js"

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
            alias: String(String(document.getElementById("alias").value).toLowerCase()).replaceAll(" ", ""),
            password:document.getElementById("password").value,
            invite_key: document.getElementById("invite-key") ? document.getElementById("invite-key").value : null
         })
    })
    res = await res.json()

    if (res.error) {
        document.getElementById("error").innerText = res.error
        document.getElementById("auth-button").innerText = document.getElementById("type").value == "login" ? "Login" : "Sign Up"
    } else {
        createCookie("sid", res.sid, 20)
        createCookie("alias", res.alias, 20)

        document.getElementById("error").innerText = ""
        window.location.href = "/home"
    }
}