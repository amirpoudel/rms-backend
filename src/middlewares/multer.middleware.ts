import multer from 'multer';
import fs from 'fs';
import path from 'path';

function generateUniqueFileName(req:any, file:any, cb:Function) {
    
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `rms-${timestamp}.${fileExtension}`;
    cb(null, uniqueFileName);
}


// Function to ensure the destination directory exists
const ensureDestinationDirectory = (destination:string) => {
    const directory = path.dirname(destination);
    if (!fs.existsSync(directory)) {
        console.log(`Creating directory: ${directory}`);
        fs.mkdirSync(directory, { recursive: true });
    }
};


const fileFilter = function (req:any, file:any, cb:Function) {
    // Accept only files with mime types image/jpeg, image/png, or image/gif
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif'||
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, or GIF files are allowed!'), false);
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = "./public/temp/images"; // Relative path for demonstration
        ensureDestinationDirectory(destinationPath);
        cb(null, destinationPath);
    },
    filename: generateUniqueFileName,


});

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 1MB
    },
});
