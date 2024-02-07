import mongoose from 'mongoose';

const connectionURL:string = process.env.MONGODB_URL||"";

async function mongodbConnect(url:string) {
    try {
        const connection = await mongoose.connect(url);
        console.log(connection.connection.host)
    } catch (error) {
        process.exit(1);
    }
}

mongodbConnect(connectionURL);

