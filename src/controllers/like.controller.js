import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Check if the user has already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })


    // If like already exists → remove it (UNLIKE)
    if (existingLike) {
        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, "Video unliked",{})
        )
    }


    // If like does NOT exist → create new like (LIKE)
    await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, "Video liked",{})
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    // Check if the logged-in user already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    // If like already exists → remove it (UNLIKE)
    if (existingLike) {

        // Delete the existing like document
        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, "Comment unliked", {})
        )
    }

    // If like does NOT exist → create a new like (LIKE)
    await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, "Comment liked", {})
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
     const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    // Check if the logged-in user already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    // If like exists → remove it (UNLIKE)
    if (existingLike) {

        // Delete existing like document
        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, "Tweet unliked", {})
        )
    }

    // If like does NOT exist → create new like (LIKE)
    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, "Tweet liked", {})
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}