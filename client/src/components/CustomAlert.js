import React from 'react';
import './CustomAlert.css'; // Humne jo CSS file banayi, use import karein

const CustomAlert = ({ message, show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="alert-backdrop">
      <div className="alert-box">
        <p className="alert-message">{message}</p>
        <button className="alert-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;