import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from 'fs';
import sharp from "sharp";

const s3Client = new S3Client({
    region:process.env.AWS_REGION||'',
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID||'',
        secretAccessKey:process.env.AWS_ACCESS_KEY_SECRECT||'',
    }

})

function extractKeyFromS3URL(url:string):string{
    const urlParts = url.split('/');
    return urlParts[urlParts.length-1] as string;
}


async function compressFile(file: any): Promise<Buffer> {
    let compressedImage;
    try {
        // Compress file
        const sharpStream = sharp(file.path)
            .resize({ width: 250 }); // Resize to 250 pixels width
        compressedImage = await sharpStream.toBuffer();
        // Close the sharp stream explicitly
        sharpStream.end();
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error; // Propagate the error to the caller
    }
    return compressedImage;
}

export async function uploadImageToS3(file: any, existingLink: string | null = null): Promise<string | null> {
    try {
        // Compress file
        const compressBuffer = await compressFile(file);

        // Upload image to S3
        const uploadParams = {
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME || '',
            Key: file.filename,
            Body: compressBuffer,
            ContentType: file.mimetype,
        };

        // If updating an existing object in S3, use the existing key
        if (existingLink) {
            uploadParams.Key = extractKeyFromS3URL(existingLink);
        }

        const s3Response = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("S3 upload response:", s3Response);

        // Construct the URL of the uploaded object
        const objectUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

        // Delete the file from local storage
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return objectUrl;
    } catch (error) {
        console.error("Error uploading image to S3:", error);

        // Delete the file from local storage if an error occurs
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return null;
    }
}


export async function deleteImageFromS3(link:string):Promise<boolean>{
    const key = extractKeyFromS3URL(link);
    const deleteParams = {
        Bucket:process.env.AWS_PUBLIC_BUCKET_NAME||'',
        Key:key,
    }
    try {
        const s3Response = await s3Client.send(new PutObjectCommand(deleteParams));
        return true;
    } catch (error) {
        return false;
    }
}




