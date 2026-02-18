class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = async (err, req, res, next) => {
  err.message = err.message || "Something went wrong on the server.";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const statusCode = 400;
    const message =
      "Duplicate entry: This value already exists. Please use a different one.";
    err = new ErrorHandler(message, statusCode);
  }

  // Invalid JWT token
  if (err.name === "JsonWebTokenError") {
    const statusCode = 401;
    const message = "Invalid or expired token. Please log in again.";
    err = new ErrorHandler(message, statusCode);
  }

  // Expired JWT token
  if (err.name === "TokenExpiredError") {
    const statusCode = 401;
    const message = "Your session has expired. Please log in again.";
    err = new ErrorHandler(message, statusCode);
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    const statusCode = 400;
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    err = new ErrorHandler(message, statusCode);
  }

  // Handle Mongoose Validation Errors
  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
