function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getVisitorId() {
    const visitorIdKey = 'visitor_id_session';
    let visitorId = sessionStorage.getItem(visitorIdKey);

    if (!visitorId) {
        visitorId = generateUniqueId();
        sessionStorage.setItem(visitorIdKey, visitorId);
    }

    return visitorId;
}

const currentVisitorId = getVisitorId();
console.log('Session Visitor ID:', currentVisitorId);

// Ganti 'websiteanda.com' dengan host yang sebenarnya
const host = window.location.hostname;
trackVisitor(host, currentVisitorId);
console.log('Host:', host);
console.log('Visitor ID:', currentVisitorId);