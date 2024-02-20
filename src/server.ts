import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

import app from './app';
import  './config/mongodb.config';
import { redisClient } from './config/redis.config';
import { logger } from './utils/winston';
redisClient.connect().then(()=>{
  console.log("redis connected");
});



const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`Server is running at Port ${PORT}`);
  console.log(`Server is running at Port ${PORT}`);
});
