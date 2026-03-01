import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";

import { verify } from "jsonwebtoken";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

export default router