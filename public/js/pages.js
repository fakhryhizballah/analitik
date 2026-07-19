function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
async function getIP() {
    try {
        const response = await fetch("https://ipapi.co/json");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json(); // Returns the parsed JSON data
    } catch (error) {
        console.error("Error fetching IP data:", error);
        throw error;
    }
}

async function sha256(text) {
    const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
async function trackVisitor(host, visitorId) {
    let ip = await getIP();
    let battery = await navigator.getBattery();
    let currentMeta = {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        os: navigator.platform,
        ip: ip.ip,
        as: ip.asn,
        isp: ip.org,
        city: ip.city,
        batteryLevel: battery.level * 100
    }
    console.log(currentMeta);
    console.log(host, visitorId);
    fetch('http://localhost:8000/api/counter/view', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "uid": visitorId,
            "url": host,
            "visitorInfo": currentMeta
        })
    })

}
let getHostname = new URL(window.location);
console.log(getHostname.hostname);
console.log(getHostname.pathname);

async function getVisitorId() {
    const visitorIdKey = getHostname.hostname;
    let data = await sha256(visitorIdKey)
    let visitorId = localStorage.getItem(data);
    if (!visitorId) {
        visitorId = generateUniqueId();
        localStorage.setItem(data, visitorId);
    }
    return visitorId;
}
// (getVisitorId());

async function cekSessi(){
    let page = `${getHostname.hostname}${getHostname.pathname}`;
    let findSesi = sessionStorage.getItem(page);
    if (!findSesi) {
        const visitorId = await getVisitorId();
        trackVisitor(page, visitorId);
        sessionStorage.setItem(page, visitorId);
    }
}
cekSessi();


// console.log(hashedVisitorId);