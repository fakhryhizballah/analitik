
require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3100;

// Konfigurasi Redis
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB
});

const maxAge = process.env.NODE_ENV == 'production' ? 10800 : 1;
const package = JSON.parse(fs.readFileSync('package.json'));
app.use(cors());
// Middleware untuk parsing body JSON
app.use(express.json());
app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
});
const routes = require('./routes');
app.use('/api', routes);
app.use("/repo/js/", express.static(path.join(__dirname + '/public/js/'), {
    setHeaders: (res, path, stat) => {
        res.set('Cache-Control', 'public, max-age=' + maxAge);
        res.set('ETag', package.version); // add etag
    }
}));
// app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, '/public/404.html'));
// });
// Menjalankan server
app.listen(port, () => {
    console.log(`API analitik berjalan di http://localhost:${port}`);
    console.log(`Redis host: ${process.env.REDIS_HOST}`);
    console.log(`Version: ${package.version}`);
});