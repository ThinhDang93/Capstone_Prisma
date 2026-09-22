const { verifyToken } = require("../utils/jwt");
const { fail } = require("../utils/response");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return fail(res, 401, "Thiếu hoặc sai định dạng token xác thực");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token); // { userId, email, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return fail(res, 401, "Token không hợp lệ hoặc đã hết hạn");
  }
}

module.exports = { requireAuth };
