import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './api-error';


 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_API_CLOUDNAME, 
        api_key: process.env.CLOUDINARY_API_key, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) {
      throw new Error('No file path provided')
    }

    if (!fs.existsSync(localFilePath)) {
          throw new Error(`File not found at path: ${localFilePath}`);
      }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    })
    console.log("File uploaded successfully to Cloudinary:", response.url);

    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.error("Cloudinary upload error:", error)
    throw new ApiError(500, {message: "cloudinary upload error"})
    
  }
}

export {uploadOnCloudinary}