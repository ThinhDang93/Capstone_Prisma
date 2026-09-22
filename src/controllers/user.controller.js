const userService = require("../services/user.service");
const { ok } = require("../utils/response");

// GET /api/users/me (userId lấy từ token)
async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.userId);
    return ok(res, user, "Lấy thông tin user thành công");
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/me — chỉnh sửa thông tin cá nhân (userId lấy từ token)
async function updateMe(req, res, next) {
  try {
    const { hoTen, tuoi, anhDaiDien } = req.body;
    const user = await userService.updateMe(req.user.userId, { hoTen, tuoi, anhDaiDien });
    return ok(res, user, "Cập nhật thông tin cá nhân thành công");
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/saved-images
async function getSavedImages(req, res, next) {
  try {
    const images = await userService.getSavedImages(req.user.userId);
    return ok(res, images, "Lấy danh sách ảnh đã lưu thành công");
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/created-images
async function getCreatedImages(req, res, next) {
  try {
    const images = await userService.getCreatedImages(req.user.userId);
    return ok(res, images, "Lấy danh sách ảnh đã tạo thành công");
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, getSavedImages, getCreatedImages };
