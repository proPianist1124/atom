// dropdown
function dropdown() {
    document.getElementById("icon").innerHTML = `
        <svg xmlns = "http://www.w3.org/2000/svg" width = "20" height = "20" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" stroke-width = "2" stroke-linecap = "round" stroke-linejoin = "round">
            <path d = "m18 15-6-6-6 6" />
        </svg>
    `
    document.getElementById("dropdown").style.display = "block"
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches(".dropdown-click")) {
        document.getElementById("icon").innerHTML = `
            <svg xmlns = "http://www.w3.org/2000/svg" width = "20" height = "20" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" stroke-width = "2" stroke-linecap = "round" stroke-linejoin = "round">
                <path d = "m6 9 6 6 6-6" />
            </svg>
        `
        document.getElementById("dropdown").style.display = "none"
    }
}