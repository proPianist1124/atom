import { fetch_api } from "/src/misc/fetch.js"
import { createCookie } from "/src/misc/cookies.js"

document.getElementById("login").addEventListener("submit", submit)

async function submit(e){
    e.preventDefault()
    e.stopImmediatePropagation()

    document.getElementById("auth-button").innerText = document.getElementById("type").value == "login" ? "Logging in..." : "Signing up..."
    
    const res = await fetch_api(`/api/${document.getElementById("type").value}`, {
        alias: String(String(document.getElementById("alias").value).toLowerCase()).replaceAll(" ", ""),
        password:document.getElementById("password").value,
        invite_key: document.getElementById("invite-key") ? document.getElementById("invite-key").value : null
    })

    if (res.error) {
        document.getElementById("error").innerText = res.error
        document.getElementById("auth-button").innerText = document.getElementById("type").value == "login" ? "Login" : "Sign Up"
    } else {
        createCookie("sid", res.sid, 24)
        createCookie("alias", res.alias, 24)

        document.getElementById("error").innerText = ""
        window.location.href = "/home"
    }
}