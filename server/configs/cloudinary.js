import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    console.log("🚀 Starting upload to Cloudinary:", file);
    console.log("📁 File exists?", fs.existsSync(file));

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    console.log("✅ Upload successful!");
    console.log("🔗 Secure URL:", result.secure_url);
    console.log("📊 Result keys:", Object.keys(result));

    // Clean up
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log("🧹 File cleaned up");
    }

    return result; // Return full object
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    console.error("❌ Error details:", error);

    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    return null;
  }
};

export default uploadOnCloudinary;
