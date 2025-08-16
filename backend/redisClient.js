const Redis = require('ioredis');
require('dotenv').config();

let redis;

if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== "") {
    redis = new Redis(process.env.REDIS_URL, {
        lazyConnect: true, 
    });
    console.log("Configured Redis for remote server.");
} else {
    redis = new Redis(); 
    console.log("Configured Redis for local server.");
}

// Event listeners
redis.on('connect', () => console.log('Redis client connected.'));
redis.on('ready', () => console.log('Redis client ready.'));
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('close', () => console.log('Redis connection closed.'));
redis.on('reconnecting', () => console.log('Redis reconnecting...'));

(async () => {
    try {
        await redis.connect();
    } catch (err) {
        console.error("Redis connection failed:", err);
    }
})();

process.on('SIGINT', async () => {
    console.log('Closing Redis connection...');
    await redis.quit();
    process.exit(0);
});

module.exports = redis;
