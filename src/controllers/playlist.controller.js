import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"


const createPlaylist = async (req, res) => {
    const { name, description } = req.body

    // Validate input
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    // Create playlist with logged-in user as owner
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, "Playlist created successfully", playlist)
    )

}

const getUserPlaylists = async (req, res) => {
    const { userId } = req.params

    // Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    // Find playlists created by this user
    const playlists = await Playlist.find({ owner: userId })
        .populate("videos", "title thumbnail")

    return res.status(200).json(
        new ApiResponse(200, "User playlists fetched successfully", playlists)
    )


}

const getPlaylistById = async (req, res) => {
    const { playlistId } = req.params

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    // Find playlist and populate videos
    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "title thumbnail views")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, "Playlist fetched successfully", playlist)
    )
}

const addVideoToPlaylist = async (req, res) => {
    const { playlistId, videoId } = req.params

    // Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // Check ownership (only owner can modify)
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    // Prevent duplicate video
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId)
        await playlist.save()
    }

    return res.status(200).json(
        new ApiResponse(200, "Video added to playlist", playlist)
    )
}

const removeVideoFromPlaylist = async (req, res) => {
    const { playlistId, videoId } = req.params

    // Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    // Remove video from playlist
    playlist.videos = playlist.videos.filter(
        v => v.toString() !== videoId
    )

    await playlist.save()

    // Return updated playlist
    return res.status(200).json(
        new ApiResponse(200, "Video removed from playlist", playlist)
    )

}

const deletePlaylist = async (req, res) => {
    const { playlistId } = req.params

    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // Check ownership (only owner can delete)
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    // Delete playlist
    await playlist.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, "Playlist deleted successfully", {})
    )
}

const updatePlaylist = async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    //  Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    //  Update fields if provided
    if (name) playlist.name = name
    if (description) playlist.description = description

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200, "Playlist updated successfully", playlist)
    )
}

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}