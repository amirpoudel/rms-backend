import { createClient, RedisClientOptions } from "redis";

interface CustomRedisClientOptions extends RedisClientOptions {
    host: string;
}
console.log("redis host", process.env.REDIS_HOST);
console.log("redis port", process.env.REDIS_PORT);

export const redisClient = createClient({
    host:'ubuntu-redis-1',
    port:6379,
    
} as CustomRedisClientOptions).on("error", (error) => {
    console.log("error in redis client", error);
});



