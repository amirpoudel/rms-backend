import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

import app from './app';
import  './config/mongodb.config';



const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at Port ${PORT}`);
});
