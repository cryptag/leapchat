import { Capacitor } from '@capacitor/core';

function vh() {
  return (window.innerHeight * 0.01) + 'px';
}
document.documentElement.style.setProperty('--vh', vh());

var lastHeight = window.innerHeight;

window.addEventListener('resize', () => {
  if (window.innerWidth > window.innerHeight ||
      Math.abs(lastHeight - window.innerHeight) > 100) {
    document.documentElement.style.setProperty(`--vh`, vh());
    lastHeight = window.innerHeight;
  }
});


document.documentElement.style.setProperty('--androidTopBar', '0px');
if (Capacitor.isNativePlatform()) {
  document.documentElement.style.setProperty('--androidTopBar', '36px');
}
