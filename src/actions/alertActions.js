export const ALERT_DISPLAY = 'ALERT_DISPLAY';
export const ALERT_DISMISS = 'ALERT_DISMISS';

export const alertSuccess = (message) =>
  ({ type: ALERT_DISPLAY, style: 'success', message });

export const alertWarning = (message) =>
  ({ type: ALERT_DISPLAY, style: 'warning', message });

export const alertDanger = (message) =>
  ({ type: ALERT_DISPLAY, style: 'danger', message })

export const dismissAlert = () => 
  ({ type: ALERT_DISMISS })
