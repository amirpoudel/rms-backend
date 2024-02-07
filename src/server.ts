import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import  './config/mongodb.config';


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at Port ${PORT}`);
});
