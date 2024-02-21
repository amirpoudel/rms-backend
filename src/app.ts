import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';

const app = express();


console.log("CORS ALLOWED",process.env.CORS_ORIGIN)
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


import userRoutes from './routes/privateRoutes/user.route'
import menuRoutes from './routes/privateRoutes/menu.route'
import publicRouts from './routes/publicRoutes/public.route'
import feedbackRoutes from './routes/privateRoutes/feedback.route'
import { authenticateUser } from './middlewares/auth.middleware';
import { errorHandler } from './utils/errorHandler';

//authenticate for private routes 

app.use("/api/v1/private",authenticateUser)
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/private/menu",menuRoutes);
app.use("/api/v1/private/feedback",feedbackRoutes);

//public routes
app.use("/api/v1/restaurant",publicRouts);

app.use(errorHandler);



// // Add CORS headers for all responses
// app.use((req, res, next) => {
//   // Set CORS headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(200);
//   } else {
//     next();
//   }})


export default app;