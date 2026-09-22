const authService = require("../services/auth.service");
const { created, ok } = require("../utils/response");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, matKhau, hoTen, tuoi, anhDaiDien } = req.body;
    const result = await authService.register({ email, matKhau, hoTen, tuoi, anhDaiDien });
    return created(res, result, "Đăng ký thành công");
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, matKhau } = req.body;
    const result = await authService.login({ email, matKhau });
    return ok(res, result, "Đăng nhập thành công");
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
