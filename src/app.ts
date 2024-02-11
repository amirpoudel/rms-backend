import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
const app = express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
  }));
app.use(bodyParser.json())
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


import userRoutes from './routes/user.route'
import menuRoutes from './routes/menu.route'

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/menu",menuRoutes);

export default app;