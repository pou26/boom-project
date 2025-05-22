import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import { Play, Heart } from 'lucide-react';

function Home() {
  const [videos, setVideos] = useState([]);
  const [heroVideo, setHeroVideo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => {
        setVideos(res.data);
        // Set the first video as hero if available
        if (res.data.length > 0) {
          setHeroVideo(res.data[0]);
        }
      })
      .catch(err => console.error('Error fetching videos:', err));
  }, []);

  const likeVideo = (id, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    axios.post(`http://localhost:5000/api/videos/like/${id}`)
      .then(() => {
        setVideos(prev => prev.map(v => v._id === id ? { ...v, likes: v.likes + 1 } : v));
        
        
        if (heroVideo && heroVideo._id === id) {
          setHeroVideo(prev => ({ ...prev, likes: prev.likes + 1 }));
        }
      })
      .catch(err => console.error('Error liking video:', err));
  };

  const playVideo = (videoId) => {
    navigate(`/videos/video/${videoId}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      {heroVideo && (
        <div className="hero-section" 
             style={{ 
               backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), 
                               url(http://localhost:5000/${heroVideo.thumbnailPath})` 
             }}>
          <div className="hero-content">
            <h1 className="hero-title">{heroVideo.title}</h1>
            <div className="hero-buttons">
              <button className="play-button" onClick={() => playVideo(heroVideo._id)}>
                <Play size={20} />
                <span>Play</span>
              </button>
              <button className="like-button hero-like" onClick={(e) => likeVideo(heroVideo._id, e)}>
                <Heart size={20} />
                <span>Like ({heroVideo.likes})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending Videos Section */}
      <div className="content-section">
        <h2 className="section-title">🔥 Trending Videos</h2>
        <div className="video-grid">
          {videos.map(video => (
            <div key={video._id} className="video-card" onClick={() => playVideo(video._id)}>
              <div className="thumbnail-container">
                <img
                  src={`http://localhost:5000/${video.thumbnailPath}`}
                  alt={video.title}
                  className="video-thumbnail"
                />
                <div className="thumbnail-overlay">
                  <button className="play-icon">
                    <Play size={36} />
                  </button>
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-actions">
                  <button className="like-btn" onClick={(e) => likeVideo(video._id, e)}>
                    <Heart size={16} />
                    <span>{video.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="content-section">
        <h2 className="section-title">🆕 Recent Uploads</h2>
        <div className="video-row">
          {videos.slice(0, 6).map(video => (
            <div key={video._id} className="video-item" onClick={() => playVideo(video._id)}>
              <div className="thumbnail-container">
                <img
                  src={`http://localhost:5000/${video.thumbnailPath}`}
                  alt={video.title}
                  className="video-thumbnail"
                />
                <div className="thumbnail-overlay">
                  <Play size={24} />
                </div>
              </div>
              <h4 className="video-title">{video.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;