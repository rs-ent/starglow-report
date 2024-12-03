// src/app/api/image-proxy/route.js

import axios from 'axios';

// Define allowed domains for security
const allowedDomains = ['firebasestorage.googleapis.com'];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL parameter is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsedUrl = new URL(url);
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the image data
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', response.headers['content-type']);
    headers.set('Cache-Control', 'public, max-age=86400'); // 1 day cache

    // Send the image data
    return new Response(response.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new Response(JSON.stringify({ error: 'Error fetching image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}