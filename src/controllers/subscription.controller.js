import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"



const toggleSubscription = async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    // Prevent subscribing to yourself
    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    // If exists → unsubscribe
    if (existingSubscription) {
        await existingSubscription.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, "Unsubscribed successfully", {})
        )
    }

    // If not → create subscription
    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    return res.status(200).json(
        new ApiResponse(200, "Subscribed successfully", {})
    )
}

// controller to return subscriber list of a channel
const getUserChannelSubscribers = async (req, res) => {
    const { channelId } = req.params
}

// controller to return channel list to which user has subscribed
const getSubscribedChannels = async (req, res) => {
    const { subscriberId } = req.params
}

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}