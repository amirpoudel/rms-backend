import { createClient } from "redis";

export const redisClient = createClient().on("error", (error) => {
    console.log("error in redis client", error);
});



