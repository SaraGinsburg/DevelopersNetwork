import React from 'react';
import { useSelector } from 'react-redux';

export default function Alert() {
  const alerts = useSelector((state) => state.alert);
  const alertMessage =
    alerts !== null &&
    alerts.length > 0 &&
    alerts.map((alert) => (
      <div key={alert.id} className={`alert alert-${alert.alertType}`}>
        {alert.msg}
      </div>
    ));
  return alertMessage;
}
