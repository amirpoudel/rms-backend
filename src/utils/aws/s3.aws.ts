import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from 'fs';

const s3Client = new S3Client({
    region:process.env.AWS_REGION||'',
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID||'',
        secretAccessKey:process.env.AWS_ACCESS_KEY_SECRECT||'',
    }

})


export async function uploadImageToS3(file:any):Promise<string|null>{
    // upload image to 
    console.log(file)
    const uploadParams = {
        Bucket:process.env.AWS_PUBLIC_BUCKET_NAME||'',
        Key:file.originalname,
        Body:fs.createReadStream(file.path),
        ContentType:file.mimetype,
    }

    try {
        const s3Response = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("this is s3Response ", s3Response);
        // Construct the URL of the uploaded object
        const objectUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
        // delete the file from local storage
        if(fs.existsSync(file.path)){
            fs.unlinkSync(file.path)
        }
        return objectUrl;
    } catch (error) {
        return null;
    }

}
