import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }



    }
    catch (error) {
        console.error("🔥 TOKEN GENERATION ERROR 🔥")
        console.error(error)
        throw new ApiError(500, "Something went wrong while generating tokens")

    }
}

const registerUser = async (req, res) => {
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

    const { fullname, email, username, password } = req.body
    console.log("email", email)

    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === ""
        )) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with the email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")


    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("CLOUDINARY AVATAR RESULT:", avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("CLOUDINARY AVATAR RESULT:", coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar saved but cloudinary issues")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.optimized,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User Registered Successfully", createdUser)
    )


}

const loginUser = async (req, res) => {
    // retrieve req body
    // check email exists or not
    // check if password is correct
    // access and refresh token 
    // send cookie 

    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "email and password required")


    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Ivalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = { httpOnly: true, secure: true }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "User Logged In Successfully",
                {
                    user: loggedInUser
                }

            )
        )







}

const logoutUser = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined

            },
            new: true
        }
    )

    const options = { httpOnly: true, secure: true }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Usser logged out"))

}

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request")
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET

        )

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")

        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = { httpOnly: true, secure: true }

        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "Access token refreshed"

                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")

    }







}

const changeCurrentPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed Successfully", {}))
}

const getCurrentUser = async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "current user fetched successfully", req.user))
}

const updateAccountDetails = async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated successfully", user))


}

const updateUserAvatar = async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar image updated successfully", user))

}
const updateUsercoverImage = async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "coverImage updated successfully", user))

}

const getUserChannelProfile = async (req, res) => {
    const { username } = req.params

    if (!username?.trim) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"

            },     
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribeTo"

            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers",

                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                email:1,
                fullname:1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1


            }
        }

    ])

    if (!channel.length){
        throw new ApiError(404, "channel does not exist")

    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "User channel fetched successfully",channel[0])
    )

}

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile
}