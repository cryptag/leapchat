export const ALERT_DISPLAY = 'ALERT_DISPLAY';
export const ALERT_DISMISS = 'ALERT_DISMISS';

export const alertSuccess = (message, alertRenderSeconds) =>
  ({ type: ALERT_DISPLAY, style: 'success', message, alertRenderSeconds });

export const alertWarning = (message, alertRenderSeconds) =>
  ({ type: ALERT_DISPLAY, style: 'warning', message, alertRenderSeconds });

export const alertDanger = (message, alertRenderSeconds) =>
  ({ type: ALERT_DISPLAY, style: 'danger', message, alertRenderSeconds });

export const dismissAlert = () => 
  ({ type: ALERT_DISMISS });
