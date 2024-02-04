// settings to change the title and favicon of tab

const config = [
    "title",
    "favicon",
    "escape"
]

document.body.addEventListener("keyup", function(e) {
    if(localStorage.getItem("escape") && localStorage.getItem("escape") != ""){
        if(e.key == "Escape"){
            window.location.href = localStorage.getItem("escape")
        }
    }else{
        if(e.key == "Escape"){
            window.location.href = "http://gg.gg/18uvk3"
        }
    }
    if(key.escape == "Enter"){
        document.cookie = "session=; Max-Age=-99999999;"
    }
})

for(let i=0; i<config.length; i++){
    if(localStorage.getItem(config[i])){
        document.getElementById(config[i]).value = localStorage.getItem(config[i])
        switch(config[i]){
            case "title":
                document.title = localStorage.getItem(config[i])
                break
            case "favicon":
                const link = document.createElement("link")
                link.setAttribute("rel", "icon")
                link.setAttribute("type", "image/x-icon")
                link.setAttribute("href", localStorage.getItem(config[i]))
                document.head.appendChild(link)
                break
        }
    }
}

document.getElementById("save_config").addEventListener("click", () => {
    for(let i=0; i<config.length; i++){
        localStorage.setItem(config[i], document.getElementById(config[i]).value)
        window.location.reload()
    }
})

document.getElementById("delete_config").addEventListener("click", () => {
    for(let i=0; i<config.length; i++){
        localStorage.removeItem(config[i]);
    }
    window.location.reload()
})