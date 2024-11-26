// src/app/components/client/MediaDisplay.js

'use client';

import React from 'react';

const MediaDisplay = ({ media, mediaTitles }) => {
  const gridColumns = media.length === 1 ? "grid-cols-1" : media.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div
      className={`grid ${gridColumns} gap-8`}
    >
      {media.map((item, index) => (
        <figure
          key={index}
          className="media-item rounded-lg"
        >
          {item.type === 'image' ? (
            <div className="relative w-full aspect-video">
              <img
                src={item.url}
                alt={mediaTitles[index] || `Media ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video">
              <video controls className="w-full h-full">
                <source src={item.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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