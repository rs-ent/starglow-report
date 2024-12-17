// src/app/components/client/MediaDisplay.js

'use client';

import React from 'react';

const MediaDisplay = ({ media, mediaTitles }) => {
  const gridColumns = media.length === 1 ? "grid-cols-1" : media.length === 2 ? "grid-cols-2" : "grid-cols-3";

  const extractYouTubeEmbedUrl = (url) => {
    try {
        let videoId = null;
        const shortsRegex = /youtube\.com\/shorts\/([\w-]+)/;
        const standardRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|.*&v=))([\w-]+)/;

        // shorts URL 처리
        const shortsMatch = url.match(shortsRegex);
        if (shortsMatch && shortsMatch[1]) {
            videoId = shortsMatch[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        // 일반 유튜브 URL 처리
        const match = url.match(standardRegex);
        if (match && match[1]) {
            videoId = match[1];
        }

        if (videoId) {
            // 시작시간 파라미터 t 지원
            const urlObj = new URL(url);
            const start = urlObj.searchParams.get('t');
            return `https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ''}`;
        }

        return url;
    } catch (error) {
        console.error('Invalid YouTube URL:', error);
        return url;
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
                  src={extractYouTubeEmbedUrl(item.url)}
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