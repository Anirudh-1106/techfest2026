function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();

  console.log(
    time + " " + req.method + " " + req.originalUrl
  );

  next();
}

module.exports = logger;