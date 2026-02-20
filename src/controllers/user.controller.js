import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

const registerUser = async (req,res)=>{
    //get user details from frotend
    // validation - not empty
    // check if user already exists: username, email
    // check for images check for avatar
    // upload to cloudinary
    // create user object
    // remove password and refreshtoken from response
    // check for user creation
    // return response

    console.log("REQ.FILES =", req.files);

    const {fullname,email,username,password}=req.body
    console.log("email",email)

    if (
        [fullname,email,username,password].some( (field)=>
            field?.trim() === ""
        ))

    {
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=await User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser){
        throw new ApiError("409","User with the email or username already exists")
    }

    const avatarLocalPath=req.files?.avatar?.[0]?.path
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")

        
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    console.log("CLOUDINARY AVATAR RESULT:", avatar);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    console.log("CLOUDINARY AVATAR RESULT:", avatar);

    if (!avatar) {
        throw new ApiError(400, "Avatar saved but cloudinary issues")  
    }

   const user=await User.create({
        fullname,
        avatar:avatar.optimized,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User Registered Successfully", createdUser )
    )


}

export {registerUser}