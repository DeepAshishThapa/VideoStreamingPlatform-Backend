import dotenv from "dotenv"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

dotenv.config({
       path: './.env'
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

export const uploadOnCloudinary = async (localpathfile) => {
    try {
        if (!localpathfile) return null

        const uploadResponse = await cloudinary.uploader.upload(localpathfile, {
            resource_type: "auto"
        })

        fs.unlinkSync(localpathfile)

        // If image → create optimized versions
        if (uploadResponse.resource_type === "image") {

            const optimizedUrl = cloudinary.url(uploadResponse.public_id, {
                fetch_format: "auto",
                quality: "auto"
            })

            const croppedUrl = cloudinary.url(uploadResponse.public_id, {
                crop: "auto",
                gravity: "auto",
                width: 500,
                height: 500
            })

            return {
                original: uploadResponse.secure_url,
                optimized: optimizedUrl,
                cropped: croppedUrl,
                public_id: uploadResponse.public_id,
                resource_type: "image"
            }
        }

        // If video → just return video URL
        if (uploadResponse.resource_type === "video") {
            return {
                original: uploadResponse.secure_url,
                public_id: uploadResponse.public_id,
                resource_type: "video"
            }
        }

        return null

    } catch (error) {
        console.error(" CLOUDINARY UPLOAD FAILED:", error)

        if (localpathfile && fs.existsSync(localpathfile)) {
            fs.unlinkSync(localpathfile)
        }

        return null
    }
}