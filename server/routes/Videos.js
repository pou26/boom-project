const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const Video = require('../models/Video');
const router = express.Router();


const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) {
  console.log(`🔍 Using ffmpeg from ffmpeg-static: ${ffmpegPath}`);
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {

  const { execSync } = require('child_process');
  try {
    const ffmpegSystemPath = execSync('where ffmpeg').toString().trim().split('\n')[0];
    if (ffmpegSystemPath) {
      console.log(`🔍 Found ffmpeg at: ${ffmpegSystemPath}`);
      ffmpeg.setFfmpegPath(ffmpegSystemPath);
    }
  } catch (err) {
    console.error('⚠️ Could not determine ffmpeg path automatically');
  }
}


const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists('uploads/videos');
ensureDirectoryExists('uploads/thumbnails');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/videos/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send('Unauthorized');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};


const generateThumbnail = (videoPath, thumbnailName, cb) => {
  const thumbnailFullPath = path.join('uploads/thumbnails', thumbnailName);
  
  console.log('📹 Starting thumbnail generation for:', videoPath);
  
  try {

    if (!fs.existsSync(videoPath)) {
      console.error(` Video file does not exist at: ${videoPath}`);
      return cb(new Error(`Video file not found: ${videoPath}`));
    }
    
    ffmpeg(videoPath)
      .on('start', commandLine => {
        console.log('🛠 FFmpeg command:', commandLine);
      })
      .on('end', () => {
        console.log(' Thumbnail generated at:', thumbnailFullPath);
        cb(null, thumbnailFullPath);
      })
      .on('error', err => {
        console.error(' FFmpeg error:', err.message || err);
        cb(err);
      })
      .screenshots({
        timestamps: ['00:00:01'],
        filename: thumbnailName,
        folder: 'uploads/thumbnails',
        size: '320x240'
      });
  } catch (err) {
    console.error(' Exception when initializing ffmpeg:', err);
    cb(err);
  }
};


router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {

    if (!req.file) {
      console.error('No file was uploaded');
      return res.status(400).send('No file was uploaded');
    }


    console.log('📄 File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const { title } = req.body;
    if (!title) {
      console.error(' No title provided');
      return res.status(400).send('Title is required');
    }

    const videoPath = req.file.path;
    const thumbnailName = Date.now() + '_thumbnail.png';
    const thumbnailUrlPath = `uploads/thumbnails/${thumbnailName}`;

    console.log('📹 Generating thumbnail for:', videoPath);
    

    generateThumbnail(videoPath, thumbnailName, async (err, thumbnailPath) => {
      if (err) {
        console.error('Thumbnail generation failed:', err);
        return res.status(500).send(`Thumbnail generation failed: ${err.message || 'Unknown error'}`);
      }

      try {
        const video = new Video({
          userId: req.user.id,
          title,
          videoPath,
          thumbnailPath: thumbnailUrlPath,
          likes: 0
        });

        await video.save();
        console.log('✅ Video uploaded with thumbnail:', thumbnailUrlPath);
        res.send('Video uploaded with thumbnail');
      } catch (dbErr) {
        console.error(' Database save failed:', dbErr);
        res.status(500).send(`Database error: ${dbErr.message}`);
      }
    });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).send(`Video upload failed: ${err.message || 'Unknown error'}`);
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    console.error('❌ Error fetching videos:', err);
    res.status(500).send('Failed to fetch videos');
  }
});


router.get('/video/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    
    const video = await Video.findById(videoId);


    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }


    res.json(video);
  } catch (err) {
    console.error(' Error fetching video by ID:', err);


    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    res.status(500).send('Failed to fetch video');
  }
});

// Like a video
router.post('/like/:id', async (req, res) => {
    await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.send('Liked');
});

module.exports = router;