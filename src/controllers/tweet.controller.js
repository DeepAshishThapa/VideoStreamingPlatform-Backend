import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"


const createTweet = async (req, res) => {
    const { content } = req.body

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

     const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })

     return res.status(201).json(
        new ApiResponse(201, "Tweet created successfully", tweet)
    )
}

const getUserTweets = async (req, res) => {
    const { userId } = req.params

     if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    // Find tweets of this user (latest first)
    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })

        return res.status(200).json(
        new ApiResponse(200, "User tweets fetched successfully", tweets)
    )


     
}

const updateTweet = async (req, res) => {
      const { tweetId } = req.params
    const { content } = req.body

        if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

     const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    //  Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

     tweet.content = content.trim()
    await tweet.save()

     return res.status(200).json(
        new ApiResponse(200, "Tweet updated successfully", tweet)
    )

}

const deleteTweet = async (req, res) => {
    const { tweetId } = req.params

     if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

      const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

     // Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

     await tweet.deleteOne()

     return res.status(200).json(
        new ApiResponse(200, "Tweet deleted successfully", {})
    )

}

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}