const saveService = require("../services/save.service");
const { ok } = require("../utils/response");

// GET /api/images/:id/saved (nguoiDungId lấy từ token)
async function checkSaved(req, res, next) {
  try {
    const result = await saveService.checkSaved(req.params.id, req.user.userId);
    return ok(res, result, "Kiểm tra trạng thái lưu ảnh thành công");
  } catch (err) {
    next(err);
  }
}

// POST /api/images/:id/save (nguoiDungId lấy từ token)
async function toggleSave(req, res, next) {
  try {
    const result = await saveService.toggleSave(req.params.id, req.user.userId);
    return ok(res, result, "Cập nhật trạng thái lưu ảnh thành công");
  } catch (err) {
    next(err);
  }
}

module.exports = { checkSaved, toggleSave };
