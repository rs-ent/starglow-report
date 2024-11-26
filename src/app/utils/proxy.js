const express = require('express');
const request = require('request');
const app = express();

app.get('/image-proxy', (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).send('URL parameter is missing');
    }
    request.get({ url: imageUrl, encoding: null }, (err, resp, body) => {
        if (err) {
            return res.status(500).send('Error fetching image');
        }
        res.set('Content-Type', resp.headers['content-type']);
        res.send(body);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});