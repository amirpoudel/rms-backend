import { createClient, RedisClientOptions } from "redis";

interface CustomRedisClientOptions extends RedisClientOptions {
    host: string;
}

export const redisClient = createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    
} as CustomRedisClientOptions).on("error", (error) => {
    console.log("error in redis client", error);
});



