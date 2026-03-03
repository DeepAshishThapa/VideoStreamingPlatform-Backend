import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"


const getChannelStats = async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user._id

    //  Get all videos of this channel
    const videos = await Video.find({ owner: channelId }).select("_id views")

    const totalVideos = videos.length

    //  Calculate total views
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0)

    const videoIds = videos.map(video => video._id)

    //  Count total likes on all videos
    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    })

    //  Count total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    return res.status(200).json(
        new ApiResponse(200, "Channel stats fetched successfully", {
            totalVideos,
            totalViews,
            totalLikes,
            totalSubscribers
        })
    )
}

const getChannelVideos = async (req, res) => {
    let { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query

    page = Number(page)
    limit = Number(limit)

    const sort = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    const aggregate = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $sort: sort
        }
    ])

    const options = {
        page,
        limit
    }

    const result = await Video.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, "Channel videos fetched successfully", result)
    )
}

export {
    getChannelStats,
    getChannelVideos
}