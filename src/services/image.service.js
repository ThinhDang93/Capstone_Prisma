const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const CREATOR_FIELDS = {
  select: { id: true, hoTen: true, anhDaiDien: true },
};

async function getImages({ search, page = 1, limit = 20 }) {
  const skip = (Number(page) - 1) * Number(limit);

  const where = search
    ? { tenHinh: { contains: String(search), mode: "insensitive" } }
    : {};

  const [items, total] = await Promise.all([
    prisma.hinhAnh.findMany({
      where,
      orderBy: { id: "desc" }, 
      skip,
      take: Number(limit),
      include: { nguoiDung: CREATOR_FIELDS },
    }),
    prisma.hinhAnh.count({ where }),
  ]);

  return {
    items,
    pagination: { page: Number(page), limit: Number(limit), total },
  };
}

async function getImageById(imageId) {
  const image = await prisma.hinhAnh.findUnique({
    where: { id: Number(imageId) },
    include: { nguoiDung: CREATOR_FIELDS },
  });

  if (!image) {
    throw new ApiError(404, "Không tìm thấy ảnh");
  }

  return image;
}

/**
 * POST /api/images -> trang thêm ảnh: POST thêm một ảnh của user
 * userId lấy từ token (req.user.userId), KHÔNG lấy từ body, theo đúng yêu cầu đề bài.
 */
async function createImage({ tenHinh, moTa, duongDan, nguoiDungId }) {
  if (!tenHinh || !duongDan) {
    throw new ApiError(400, "tenHinh và duongDan là bắt buộc");
  }

  return prisma.hinhAnh.create({
    data: { tenHinh, moTa, duongDan, nguoiDungId: Number(nguoiDungId) },
    include: { nguoiDung: CREATOR_FIELDS },
  });
}

/**
 * DELETE /api/images/:id -> xóa ảnh đã tạo theo id ảnh (trang quản lý)
 * Chỉ chủ sở hữu (người tạo, xác định qua token) mới được xóa.
 */
async function deleteImage(imageId, requesterId) {
  const image = await prisma.hinhAnh.findUnique({ where: { id: Number(imageId) } });

  if (!image) {
    throw new ApiError(404, "Không tìm thấy ảnh");
  }

  if (image.nguoiDungId !== Number(requesterId)) {
    throw new ApiError(403, "Bạn không có quyền xóa ảnh này");
  }

  await prisma.hinhAnh.delete({ where: { id: Number(imageId) } });

  return { id: Number(imageId) };
}

module.exports = { getImages, getImageById, createImage, deleteImage };
