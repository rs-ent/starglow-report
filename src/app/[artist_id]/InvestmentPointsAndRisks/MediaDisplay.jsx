// src/app/components/client/MediaDisplay.js

'use client';

import React from 'react';

const MediaDisplay = ({ media, mediaTitles }) => {
  const gridColumns = media.length === 1 ? "grid-cols-1" : media.length === 2 ? "grid-cols-2" : "grid-cols-3";

  const extractYouTubeId = (url) => {
    try {
        const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|.*&v=))([\w-]{11})(?:.*t=(\d+))?/;
        const match = url.match(youtubeRegex);
        
        if (match) {
            const videoId = match[1]; // YouTube Video ID
            const start = match[2];  // 시작 시간 (t 파라미터)
            return `https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ''}`;
        } else {
            console.error('Not a valid YouTube URL');
            return url; // YouTube URL이 아니면 원본 URL 반환
        }
    } catch (error) {
        console.error('Error processing URL:', error);
        return url; // 잘못된 URL이면 원본 URL 반환
    }
  };

  return (
    <div
      className={`grid ${gridColumns} gap-8`}
    >
      {media.map((item, index) => (
        <figure
          key={index}
          className="media-item rounded-lg mb-4"
        >
          {item.type === 'image' ? (
            <div className="relative w-full">
              <img
                src={item.url}
                alt={mediaTitles[index] || `Media ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-w-16 aspect-h-9">
              <iframe
                  className="w-full h-full rounded-md shadow-soft transition-transform transform"
                  src={extractYouTubeId(item.url)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video"
              ></iframe>
            </div>
          )}
          {mediaTitles[index] && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {mediaTitles[index]}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
};

export default MediaDisplay;