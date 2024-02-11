import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from 'fs';
import { ObjectCannedACL } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region:process.env.AWS_REGION||'',
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID||'',
        secretAccessKey:process.env.AWS_ACCESS_KEY_SECRECT||'',
    }

})


export async function uploadImageToS3(file:any){
    // upload image to 
    console.log(file)
    const uploadParams = {
        Bucket:process.env.AWS_PUBLIC_BUCKET_NAME||'',
        Key:file.originalname,
        Body:fs.createReadStream(file.path),
        ContentType:file.mimetype,
        ACL:'public-read' as ObjectCannedACL, // Cast the string value to ObjectCannedACL type
    }

    const s3Response = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("this is s3Response ", s3Response);
    // delete the file from local storage
    fs.unlinkSync(file.path);


}