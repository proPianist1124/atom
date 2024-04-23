export function getCookie(cname) {
    let name = `${cname}=`
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == " ") {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

export function createCookie(name, value, minutes) {
    if (minutes) {
        let date = new Date()
        date.setTime(date.getTime() + (minutes * 60 * 1000))
        var expires = `expires=${date.toGMTString()}`
    } else {
        var expires = ""
    }
    document.cookie = `${name}=${value}; ${expires}; path=/`
}