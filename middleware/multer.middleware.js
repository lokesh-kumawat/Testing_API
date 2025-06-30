import multer from 'multer';
import fs from 'fs';

// Ensure uploads directory exists
const uploadFile = "/tmp/uploads";
if(!fs.existsSync(uploadFile)) {
    fs.mkdirSync(uploadFile, {recursive: true});
}

// multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFile);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});


const upload = multer({storage})
export { upload }