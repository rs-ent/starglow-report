import React from 'react';

const SpotifyButton = () => {
  const handleClick = () => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES.join(' '))}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
  };

  return <button onClick={handleClick}>SPOTIFY</button>;
};

export default SpotifyButton;