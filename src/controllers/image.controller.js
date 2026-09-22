const imageService = require("../services/image.service");
const { ok, created } = require("../utils/response");

// GET /api/images  &  GET /api/images?search=abc
async function getImages(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await imageService.getImages({ search, page, limit });
    return ok(res, result, "Lấy danh sách ảnh thành công");
  } catch (err) {
    next(err);
  }
}

// GET /api/images/:id
async function getImageById(req, res, next) {
  try {
    const image = await imageService.getImageById(req.params.id);
    return ok(res, image, "Lấy thông tin ảnh thành công");
  } catch (err) {
    next(err);
  }
}

// POST /api/images — trang thêm ảnh (nguoiDungId lấy từ token)
async function createImage(req, res, next) {
  try {
    const { tenHinh, moTa, duongDan } = req.body;
    const image = await imageService.createImage({
      tenHinh,
      moTa,
      duongDan,
      nguoiDungId: req.user.userId,
    });
    return created(res, image, "Thêm ảnh thành công");
  } catch (err) {
    next(err);
  }
}

// DELETE /api/images/:id (chỉ chủ ảnh mới xóa được, xác định qua token)
async function deleteImage(req, res, next) {
  try {
    const result = await imageService.deleteImage(req.params.id, req.user.userId);
    return ok(res, result, "Xóa ảnh thành công");
  } catch (err) {
    next(err);
  }
}

module.exports = { getImages, getImageById, createImage, deleteImage };
