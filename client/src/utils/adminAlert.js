// adminAlert.js - Helper for dispatching universal admin toast/pop alert
export const notifyAdmin = (type = 'success', message = '', title = '') => {
  if (typeof window !== 'undefined') {
    if (window.showAdminAlert) {
      window.showAdminAlert({ type, message, title });
    } else {
      window.dispatchEvent(
        new CustomEvent('ternakmart_admin_alert', {
          detail: { type, message, title }
        })
      );
    }
  }
};

export const notifyAdminSuccess = (message, title = 'Berhasil!') => notifyAdmin('success', message, title);
export const notifyAdminError = (message, title = 'Gagal') => notifyAdmin('error', message, title);
export const notifyAdminWarning = (message, title = 'Perhatian') => notifyAdmin('warning', message, title);
