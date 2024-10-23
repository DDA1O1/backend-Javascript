import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinaryImage = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return new Error("localFilePath not found");
        }
        // upload image to cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded to cloudinary
        // console.log("file has been uploaded to cloudinary", uploadResult.url);

        // remove the locally uploaded file
        fs.unlinkSync(localFilePath);
        return uploadResult.url;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally uploaded file as the upload to cloudinary failed
        return null;
    }
};

export { uploadOnCloudinaryImage };
      