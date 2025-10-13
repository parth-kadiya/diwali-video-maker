import React from 'react';
import CertificateForm from './components/CertificateForm';
import './App.css';
import './popup.css';

function App() {
  return (
    <div className="App">
      <div className="main-content-wrapper"> {/* Ek naya wrapper add kiya */}
        <CertificateForm />
      </div>
      {/* === YAHAN AAPKA CREDIT ADD KIYA HAI === */}
      <p className="developer-credit">
        Developed by Parth Kadiya
      </p>
    </div>
  );
}

export default App;