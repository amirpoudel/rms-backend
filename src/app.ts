import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';

const app = express();


// Define your array of allowed origins
const allowedOrigins = JSON.parse(process.env.CORS_ORIGIN || "[]");

// Setup CORS with allowed origins
app.use(cors({
  origin: function (origin, callback) {
    // Check if the origin is in the allowed origins array
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(bodyParser.json())
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


export default app;