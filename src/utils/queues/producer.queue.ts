import { Queue, tryCatch } from "bullmq";
import { ISendEmail } from "../../types/email.type";

const queueConfig = {
    connection:{
        host: process.env.REDIS_QUEUE_HOST,
        port: Number(process.env.REDIS_QUEUE_PORT),
        username: process.env.REDIS_QUEUE_USERNAME,
        password: process.env.REDIS_QUEUE_PASSWORD,
    }
}

const notificationEmailQueue = new Queue("notification-email", queueConfig);
const notificationPhoneQueue = new Queue("notification-phone",queueConfig);


export const sendEmail = async (data:ISendEmail) =>{
    
    try {
        await notificationEmailQueue.add("sendEmail", data);
        console.log("Email sent to queue")
    } catch (error) {
        console.log("Error in sending email")
        console.log(error);
    }
}










