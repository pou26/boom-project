const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  videoPath: String,
  thumbnailPath: String,
  likes: { type: Number, default: 0 },
  
});

module.exports = mongoose.model('Video', VideoSchema);
