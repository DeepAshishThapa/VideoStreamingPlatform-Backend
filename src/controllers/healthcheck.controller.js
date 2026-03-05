import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"

const healthcheck = async (req, res) => {
     // Return simple OK response to confirm server is running
    return res.status(200).json(
        new ApiResponse(200, "Server is running healthy", {
            status: "OK"
        })
    )
}

export {
    healthcheck
    }