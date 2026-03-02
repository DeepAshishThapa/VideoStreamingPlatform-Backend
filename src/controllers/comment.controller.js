import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    page = Number(page)
    limit = Number(limit)

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Build aggregation
    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: { createdAt: -1 } // newest first
        },
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
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.avatar": 1
            }
        }
    ])

    // Pagination
    const options = {
        page,
        limit
    }

    const result = await Comment.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", result)
    )



})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Validate content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    // Check if video exists
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Create comment
    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    // Populate owner info for response
    const populatedComment = await Comment.findById(comment._id)
        .populate("owner", "username avatar")

    return res.status(201).json(
        new ApiResponse(201, "Comment added successfully", populatedComment)
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    // Validate content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Ownership check
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment")
    }

    // Update content
    comment.content = content.trim()
    await comment.save()

    // Populate owner for response
    const updatedComment = await Comment.findById(comment._id)
        .populate("owner", "username avatar")

    return res.status(200).json(
        new ApiResponse(200, "Comment updated successfully", updatedComment)
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    //  Validate ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Ownership check
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment")
    }

    //  Delete comment
    await comment.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}