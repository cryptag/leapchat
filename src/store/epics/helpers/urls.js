
let hostname;
if (typeof window.location !== "undefined") {
  hostname = window.location.origin;
} else {
  // hard-coded for mobile device scenarios
  hostname = "http://locahost:8080";
}

export const authUrl = `${hostname}/api/login`;

const wsHostname = hostname.replace('http', 'ws');

export const wsUrl = `${wsHostname}/api/ws/messages/all`;