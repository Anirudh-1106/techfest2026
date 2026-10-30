function notFound(req, res) {
  res.status(404).json({
    message: "Route not found"
  });
}

function errorHandler(err, req, res, next) {
  console.log("ERROR:", err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Origin not allowed"
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid id"
    });
  }

  res.status(500).json({
    message: "Server error"
  });
}

module.exports = {
  notFound,
  errorHandler
};