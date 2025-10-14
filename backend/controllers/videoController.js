// diwali\backend\controllers\videoController.js (Fully Updated)

const User = require('../models/userModel');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

exports.generateVideo = async (req, res) => {
  const { name, photo } = req.body;

  if (!name || !photo) {
    return res.status(400).json({ msg: 'Name and photo are required.' });
  }

  try {
    const newUser = new User({ name });
    await newUser.save();
  } catch (dbError) {
    console.error('Database Error:', dbError);
    return res.status(500).json({ msg: 'Failed to save user data.' });
  }

  const base64Data = photo.replace(/^data:image\/png;base64,/, "");
  const photoFileName = `${Date.now()}_photo.png`;
  const photoPath = path.join(__dirname, '..', 'uploads', photoFileName);
  const outputFileName = `${Date.now()}_certificate.mp4`;
  const outputPath = path.join(__dirname, '..', 'uploads', outputFileName);

  fs.writeFileSync(photoPath, base64Data, 'base64');

  const videoPath = path.join(__dirname, '..', 'assets', 'diwali.mp4');
  let fontPath = path.join(__dirname, '..', 'assets', 'times.ttf');
  
    // ===== YAHAN NAYA LOGIC ADD HUA HAI =====
    // Check karenge ki code Windows par chal raha hai ya nahi
    if (process.platform === 'win32') {
        // Agar Windows hai, to path ko FFmpeg ke liye escape karenge
        fontPath = fontPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    }
    // Agar Linux (Render) hai, to path waisa hi rahega jaisa pehle tha
    // =======================================

  const photoSize = 680;
  const photoX = (1080 - photoSize) / 2;
  const photoY = 288;
  const nameFontSize = 37;
  const nameY = 'h-110';
  const escapedName = name.replace(/'/g, "'\\''");

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(photoPath)
        .complexFilter([
          `[1:v] scale=${photoSize}:${photoSize} [scaled_photo]`,
          `[0:v][scaled_photo] overlay=x=${photoX}:y=${photoY} [bg_with_photo]`,
          `[bg_with_photo] drawtext=fontfile='${fontPath}':text='${escapedName}':x=(w-text_w)/2:y=${nameY}:fontsize=${nameFontSize}:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2`
        ])
        .outputOptions('-c:a copy')
        .toFormat('mp4')
        .on('end', () => resolve())
        .on('error', (err) => {
          console.error('FFmpeg Error:', err.message);
          reject(new Error('Video generation failed'));
        })
        .save(outputPath);
    });

    res.download(outputPath, `${name}_diwali_wishes.mp4`, (err) => {
      if (err) {
        console.error('Download Error:', err);
      }
      fs.unlinkSync(photoPath);
      fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error('Processing Error:', error);
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ msg: error.message });
  }
};