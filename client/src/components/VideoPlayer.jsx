import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Heart, Share2, Plus, ThumbsUp } from 'lucide-react';
import './VideoPlayer.css';

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the specific video
    axios.get(`http://localhost:5000/api/videos/video/${id}`)
      .then(res => {
        setVideo(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching video:', err);
        setError('Failed to load video. Please try again later.');
        setLoading(false);
      });

    // Fetch related videos
    axios.get('http://localhost:5000/api/videos')
      .then(res => {
       
        const filtered = res.data.filter(v => v._id !== id).slice(0, 6);
        setRelatedVideos(filtered);
      })
      .catch(err => console.error('Error fetching related videos:', err));
  }, [id]);

  const likeVideo = () => {
    axios.post(`http://localhost:5000/api/videos/like/${id}`)
      .then(() => {
        setVideo(prev => ({ ...prev, likes: prev.likes + 1 }));
      })
      .catch(err => console.error('Error liking video:', err));
  };

  const goBack = () => {
    navigate('/');
  };

  const playRelatedVideo = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={goBack} className="back-button">
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="video-player-container">
      {/* Main video section */}
      <div className="video-main-section">
        <button onClick={goBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        
        <div className="video-player-wrapper">
          <video 
            src={`http://localhost:5000/${video.videoPath}`} 
            className="main-video-player" 
            controls 
            autoPlay
          />
        </div>
        
        <div className="video-info-container">
          <div className="video-title-container">
            <h1 className="video-title">{video.title}</h1>
            <div className="video-actions">
              <button className="action-button" onClick={likeVideo}>
                <ThumbsUp size={20} />
                <span>{video.likes}</span>
              </button>
              <button className="action-button">
                <Plus size={20} />
                <span>My List</span>
              </button>
              <button className="action-button">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="video-details">
            <div className="upload-info">
              <span className="upload-date">Uploaded on {new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="video-description">
              {video.description || "No description available for this video."}
            </p>
          </div>
        </div>
      </div>

      {/* Related videos section */}
      <div className="related-videos-section">
        <h2 className="related-title">More Videos Like This</h2>
        <div className="related-videos-grid">
          {relatedVideos.map(relVideo => (
            <div 
              key={relVideo._id} 
              className="related-video-card"
              onClick={() => playRelatedVideo(relVideo._id)}
            >
              <div className="related-thumbnail-container">
                <img 
                  src={`http://localhost:5000/${relVideo.thumbnailPath}`} 
                  alt={relVideo.title} 
                  className="related-thumbnail"
                />
                <div className="related-play-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className="related-video-info">
                <h3 className="related-video-title">{relVideo.title}</h3>
                <div className="related-video-meta">
                  <span className="related-video-likes">
                    <Heart size={14} /> {relVideo.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;