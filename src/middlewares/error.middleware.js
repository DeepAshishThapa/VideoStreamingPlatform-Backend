
const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message, stack } = err

  res.status(statusCode).json({
    success: false,
    message: message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack })
  })
}
export default errorHandler