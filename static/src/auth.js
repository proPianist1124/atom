document.getElementById("login").addEventListener("submit",submit)
async function submit(e){
    e.preventDefault()
    const res = await fetch(`/${document.getElementById("type").value}`, {
        headers:{
            "Content-Type":"application/json"
        },
        method:"POST",
        body:JSON.stringify({ alias:document.getElementById("alias").value, password:document.getElementById("password").value})
    })
    const data = await res.json()
    if(data.error){
        document.getElementById("error").innerText = data.error
    }else{
        function createCookie(name,value,minutes) {
            if(minutes) {
                var date = new Date()
                date.setTime(date.getTime()+(minutes*60*1000))
                var expires = `expires=${date.toGMTString()}`
            }else{
                var expires = ""
            }
            document.cookie = `${name}=${value}; ${expires}; path=/`
        }

        createCookie("session", JSON.stringify(data), 10)

        document.getElementById("error").innerText = ""
        window.location.href = "/"
    }
}