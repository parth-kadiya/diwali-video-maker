import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cropper from 'cropperjs';

const CertificateForm = () => {
  const [name, setName] = useState('');
  const [fileText, setFileText] = useState('No photo chosen');
  const [croppedPhoto, setCroppedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const modalImageRef = useRef(null);
  const croppedPreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const cropperRef = useRef(null);

  const audioRef = useRef(null);

  useEffect(() => {
    // --- Fireworks Script wala logic (koi change nahi) ---
    if (!window.initFireworks) {
        const script = document.createElement('script');
        script.src = process.env.PUBLIC_URL + '/fireworks.js';
        script.async = true;
        script.onload = () => {
            if (window.initFireworks) {
                window.initFireworks();
            }
        };
        document.body.appendChild(script);
    } else {
        window.initFireworks();
    }
    
    // --- Audio Logic ---
    const audio = new Audio(process.env.PUBLIC_URL + '/audio/fireworks.mp3');
    audio.loop = true;
    audioRef.current = audio;

    const playPromise = audioRef.current.play();
    let clickListener = null;

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio autoplay was prevented. Waiting for user interaction.");
        
        const playAudioOnClick = () => {
          audioRef.current.play().catch(e => console.error("Could not play audio after click:", e));
          document.removeEventListener('click', playAudioOnClick);
        };
        
        clickListener = playAudioOnClick;
        document.addEventListener('click', clickListener);
      });
    }

    // === YAHAN NAYA CODE ADD HUA HAI ===
    // 1. Visibility Change ko handle karne ke liye function
    const handleVisibilityChange = () => {
      // Agar page background mein chala gaya hai, to audio pause karo
      if (document.hidden) {
        audioRef.current.pause();
      } else {
        // Agar page wapas saamne aaya hai, to audio play karo
        audioRef.current.play().catch(e => console.error("Could not resume audio:", e));
      }
    };

    // 2. Page Visibility ke liye Event listener add karte hain
    document.addEventListener('visibilitychange', handleVisibilityChange);


    // Cleanup function: Jab component hatega to sab kuch saaf ho jayega
    return () => {
      // Fireworks script ko remove karne ka logic
      const script = document.querySelector(`script[src*="fireworks.js"]`);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (window.initFireworks) {
        delete window.initFireworks;
      }

      // Audio ko rokne aur saaf karne ka logic
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Click listener ko hata do
      if (clickListener) {
        document.removeEventListener('click', clickListener);
      }
      
      // === NAYE EVENT LISTENER KO BHI CLEANUP MEIN REMOVE KARNA ZAROORI HAI ===
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); 


  // ... Baaki ka poora component code jaisa tha waisa hi rahega ...
  // (handleFileChange, closeModal, handleCrop, handleDownload, and return JSX)

  const handleFileChange = (e) => {
  setPhotoError('');
  const file = e.target.files[0];
  if (!file) return;
  const fileName = file.name;
  const maxLength = 35; // Aap is length ko kam ya zyada kar sakte hain
if (fileName.length > maxLength) {
  const lastDot = fileName.lastIndexOf('.');
  const namePart = fileName.substring(0, lastDot);
  const extPart = fileName.substring(lastDot);
  
  const truncatedName = namePart.substring(0, maxLength - extPart.length - 4); // "...." ke liye 4 characters
  setFileText(`${truncatedName}....${extPart}`);
} else {
  setFileText(fileName);
}
  if (!/^image\/(jpe?g|png)$/.test(file.type)) {
   setPhotoError("Please upload a valid image file (JPG, PNG).");
   return;
  }
  const reader = new FileReader();
  reader.onload = () => {
   if (modalImageRef.current) {
    modalImageRef.current.src = reader.result;
    document.getElementById('crop-modal').style.display = 'flex';
    if (cropperRef.current) {
     cropperRef.current.destroy();
    }
    cropperRef.current = new Cropper(modalImageRef.current, {
     aspectRatio: 1,
     viewMode: 1,
     autoCropArea: 1,
     zoomable: true,
     background: false,
     movable: true,
    });
   }
  };
  reader.readAsDataURL(file);
 };

 const closeModal = () => {
  document.getElementById('crop-modal').style.display = 'none';
  if (cropperRef.current) {
   cropperRef.current.destroy();
   cropperRef.current = null;
  }
  if (fileInputRef.current) {
   fileInputRef.current.value = "";
  }
  setFileText("No photo chosen");
  setCroppedPhoto(null);
  if(croppedPreviewRef.current) {
   croppedPreviewRef.current.style.display = 'none';
  }
 };

 const handleCrop = () => {
  if (!cropperRef.current) return;
  const croppedCanvas = cropperRef.current.getCroppedCanvas({ width: 600, height: 600 });
  const circularCanvas = document.createElement('canvas');
  circularCanvas.width = 600;
  circularCanvas.height = 600;
  const ctx = circularCanvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(300, 300, 300, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(croppedCanvas, 0, 0, 600, 600);
  const dataUrl = circularCanvas.toDataURL('image/png');
  setCroppedPhoto(dataUrl);
  if (croppedPreviewRef.current) {
    const pctx = croppedPreviewRef.current.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      pctx.clearRect(0, 0, 150, 150);
      pctx.beginPath();
      pctx.arc(75, 75, 75, 0, Math.PI * 2, true);
      pctx.clip();
      pctx.drawImage(img, 0, 0, 150, 150);
    };
    croppedPreviewRef.current.style.display = 'block';
  }
  document.getElementById('crop-modal').style.display = 'none';
  if (cropperRef.current) {
   cropperRef.current.destroy();
   cropperRef.current = null;
  }
 };

 const handleDownload = async () => {
  let hasError = false;
  if (!name.trim()) {
   setNameError('Please Enter your name');
   hasError = true;
  } else {
   setNameError('');
  }
  if (!croppedPhoto) {
   setPhotoError('Please upload and crop your photo');
   hasError = true;
  } else {
   setPhotoError('');
  }
  if (hasError) return;
  if (audioRef.current) {
      audioRef.current.pause();
  }
  setIsLoading(true);
  try {
   const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   const response = await axios.post(`${apiUrl}/api/generate-video`, {
    name: name,
    photo: croppedPhoto,
   }, { responseType: 'blob' });
   const url = window.URL.createObjectURL(new Blob([response.data]));
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', `${name}_wishes.mp4`);
   document.body.appendChild(link);
   link.click();
   link.parentNode.removeChild(link);
  } catch (error) {
   console.error('Error generating video:', error);
   alert('Sorry, something went wrong. Please try again.');
  } finally {
   setIsLoading(false);
  }
 };

 return (
  <>
   <canvas id="canvas"></canvas>
   <div className="form-card">
    <div className="form-content-wrapper">
     <h2 className="form-title">
  <span className="title-happy">Happy</span>
  <span className="title-diwali">Diwali!</span>
</h2>
     <form id="doctorForm" onSubmit={(e) => e.preventDefault()}>
      <label>
       <input
        type="text"
        name="name"
        placeholder="Enter your Name"
        value={name}
        onChange={(e) => {
         setName(e.target.value);
         if (nameError) setNameError('');
        }}
        required
       />
       <div className="error-msg name-error text-danger small">{nameError}</div>
      </label>
      <label className="file-wrap">
  <div className="file-upload-design">
    <i className="fa-solid fa-cloud-arrow-up"></i>
    <p>Click to Upload Photo</p>
  </div>
  <input
    type="file"
    id="file-input"
    ref={fileInputRef}
    accept=".jpg, .jpeg, .png"
    onChange={handleFileChange}
    required
  />
</label>
<div className="file-name-display">{fileText}</div>
      <div className="error-msg photo-error text-danger small mt-1 mb-2">{photoError}</div>
      <canvas id="cropped-preview" ref={croppedPreviewRef} width="150" height="150" style={{ borderRadius: '50%' }}></canvas>
      <div className="text-center">
        <button type="button" id="download-btn" className="btn-submit" onClick={handleDownload} disabled={isLoading}>
            {isLoading ? (
                <>
                  <span className="loader"></span>
                  <span>Generating Video...</span>
                </>
            ) : (
                'Generate Video'
            )}
        </button>
    </div>

    {isLoading && (
        <p className="processing-message">
            Processing video... takes around 1 min.
        </p>
    )}
     </form>
    </div>
   </div>
   <div id="crop-modal" className="modal">
    <div className="modal-content">
     <button className="close-modal" aria-label="Close" onClick={closeModal}>
      <i className="fa fa-times"></i>
     </button>
     <div className="image-crop-container">
      <img id="modal-image-preview" ref={modalImageRef} alt="Crop Preview" />
     </div>
     <button id="continue-btn" onClick={handleCrop}>Save & Crop</button>
    </div>
   </div>
  </>
 );
};

export default CertificateForm;