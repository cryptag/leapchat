import { Capacitor } from '@capacitor/core';

let hostname = window.location.origin;

if (Capacitor.isNativePlatform()){
  hostname = "http://10.0.2.2:8080";
}

export const authUrl = `${hostname}/api/login`;

const wsHostname = hostname.replace('http', 'ws');

export const wsUrl = `${wsHostname}/api/ws/messages/all`;