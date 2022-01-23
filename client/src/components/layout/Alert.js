import React from 'react';
import { useSelector } from 'react-redux';

export default function Alert() {
  const alerts = useSelector((state) => state.alert);
  console.log('alerts', alerts);

  return (
    <div className='alert-wrapper'>
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
          {alert.msg}
        </div>
      ))}
    </div>
  );
}
