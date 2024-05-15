export async function fetch_api(route, body) {
    let res = await fetch(route, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    res = await res.json();

    return res;
}