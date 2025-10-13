// diwali\backend\controllers\videoController.js (Updated Code)

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
    const fontPath = path.join(__dirname, '..', 'assets', 'times.ttf');
    
    // YAHAN BADLAV KIYA GAYA HAI - Windows specific escaping hata di gayi hai
    // const escapedFontPath = fontPath.replace(/\\/g, '/').replace(/:/g, '\\:'); // Is line ko hata dein

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
                    // YAHAN BHI BADLAV HUA HAI: escapedFontPath ki jagah fontPath use karein
                    `[bg_with_photo] drawtext=fontfile=${fontPath}:text='${escapedName}':x=(w-text_w)/2:y=${nameY}:fontsize=${nameFontSize}:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2`
                ])
                .outputOptions([
                    '-preset ultrafast', // CPU ka use kam karega
                    '-crf 28',           // Thodi quality kam karke file size aur processing time kam karega
                    '-c:a copy'          // Audio ko waisa hi rakhega
                ])
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