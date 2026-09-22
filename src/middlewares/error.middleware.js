const { fail } = require("../utils/response");

function notFoundHandler(req, res, next) {
  return fail(res, 404, `Không tìm thấy route: ${req.method} ${req.originalUrl}`);
}

function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi hệ thống, vui lòng thử lại sau";

  return fail(res, statusCode, message);
}

module.exports = { notFoundHandler, errorHandler };
