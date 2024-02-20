import { createClient } from 'redis';



const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
console.log('redisUrl:', redisUrl);
const redisOptions = {
    url: redisUrl,
    password: process.env.REDIS_PASSWORD
};

// Create Redis client
export const redisClient = createClient(redisOptions)
    .on('error', (err) => {
        console.error('Redis Error:', err);
    })
    .on('ready', () => {
        console.log('Connected to Redis');
    });