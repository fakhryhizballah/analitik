function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getVisitorId() {
    const visitorIdKey = 'visitor_id_session';
    let visitorId = localStorage.getItem(visitorIdKey);

    if (!visitorId) {
        visitorId = generateUniqueId();
        localStorage.setItem(visitorIdKey, visitorId);
    }

    return visitorId;
}
const currentVisitorId = getVisitorId();
let getHostname = new URL(window.location);
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
    fetch('https://count.spairum.my.id/api/track/unique', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ host, visitorId })
    })

}
console.log('Session Visitor ID:', currentVisitorId);
async function trak(host) {
    let keyCookie = await sha256(host);
    const cookieExists = document.cookie.split(';').some(item => item.trim().startsWith(`${keyCookie}=`));
    if (!cookieExists) {
        trackVisitor(host, currentVisitorId);
        document.cookie = `${keyCookie}=${currentVisitorId}; path=/; max-age=86400;`;
    }
}
// Ganti 'websiteanda.com' dengan host yang sebenarnya
trak(getHostname.hostname);
trak(getHostname.hostname + getHostname.pathname);


function getTrackUnique(host) {
    return fetch('https://count.spairum.my.id/api/analytics/unique/' + host, {
    }).then((response) => response.json());

}
// format date: YYYY-MM-DD;
function getTrackbyDate(host, date) {
    return fetch('https://count.spairum.my.id/api/analytics/track/' + host + '/' + date, {
    }).then((response) => response.json());

}