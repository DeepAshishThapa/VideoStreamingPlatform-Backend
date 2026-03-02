import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    page = Number(page)
    limit = Number(limit)

    //  Build match filter
    const match = {
        isPublished: true
    }

    // Search by title
    if (query) {
        match.title = { $regex: query, $options: "i" }
    }

    // Filter by owner (for channel page)
    if (userId && isValidObjectId(userId)) {
        match.owner = new mongoose.Types.ObjectId(userId)
    }

    //  Build sort object
    const sort = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    //  Create aggregation pipeline
    const aggregate = Video.aggregate([
        { $match: match },
        { $sort: sort }
    ])

    //  Pagination options
    const options = {
        page,
        limit
    }

    const result = await Video.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, "Videos fetched successfully", result)
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    // get local file path from multer
    const videoLocalPath = req.files?.videoFile?.[0].path
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is required")
    }

    // upload to cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!uploadedVideo?.original) {
        throw new ApiError(500, "Error uploading video")
    }

    if (!uploadedThumbnail?.optimized) {
        throw new ApiError(500, "Error uploading thumbnail")
    }

    // 4️ Save video to database
    const video = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.original,
        thumbnail: uploadedThumbnail.optimized,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, "Video uploaded successfully", video)
    )


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // get video with comments and likes    
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },

        // lookup owner
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },

        //lookup likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        //lookup comments
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        // Add computed fields
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
                isLiked: {
                    $in: [
                        req.user?._id,
                        "$likes.likedBy"
                    ]
                }
            }
        },

        // clean output
        {
            $project: {
                "owner.password": 0,
                likes: 0
            }
        }
    ])

    if (!video.length) {
        throw new ApiError(404, "Video not found")
    }

    // Increment views seperately
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })

    return res.status(200).json(
        new ApiResponse(200, "Video fetched successfully", video[0])
    )



})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video")
    }


    // Update title/description if provided
    if (title) video.title = title
    if (description) video.description = description


    // If new thumbnail uploaded
    const thumbnailLocalPath = req.file?.path

    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if (!uploadedThumbnail?.optimized) {
            throw new ApiError(500, "Error uploading thumbnail")
        }

        video.thumbnail = uploadedThumbnail.optimized
    }

    // Save changes
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, "Video updated successfully", video)
    )



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Ownership check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video")
    }

    // Delete from database
    await video.deleteOne()


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Ownership check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this video")
    }

    // Toggle status
    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            `Video is now ${video.isPublished ? "Published" : "Unpublished"}`,
            { isPublished: video.isPublished }
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}