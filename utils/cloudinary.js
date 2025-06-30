import { v2 as cloudinary } from 'cloudinary';

// coludinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export { cloudinary }


// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) {
//             console.log("file path not found");
//         }
//         // file upload on cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         // file has been uploaded successfully
//         console.log('file is uploaded on cloudinary', response.secure_url);
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
//     }
// }

// export { uploadOnCloudinary }



