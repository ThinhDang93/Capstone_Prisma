const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const AUTHOR_FIELDS = {
  select: { id: true, hoTen: true, anhDaiDien: true },
};

async function getCommentsByImageId(imageId) {
  const image = await prisma.hinhAnh.findUnique({ where: { id: Number(imageId) } });
  if (!image) {
    throw new ApiError(404, "Không tìm thấy ảnh");
  }

  return prisma.binhLuan.findMany({
    where: { hinhId: Number(imageId) },
    orderBy: { id: "asc" },
    include: { nguoiDung: AUTHOR_FIELDS },
  });
}

async function createComment(imageId, nguoiDungId, noiDung) {
  if (!noiDung || !noiDung.trim()) {
    throw new ApiError(400, "Nội dung bình luận không được để trống");
  }

  const image = await prisma.hinhAnh.findUnique({ where: { id: Number(imageId) } });
  if (!image) {
    throw new ApiError(404, "Không tìm thấy ảnh");
  }

  return prisma.binhLuan.create({
    data: {
      noiDung: noiDung.trim(),
      hinhId: Number(imageId),
      nguoiDungId: Number(nguoiDungId),
    },
    include: { nguoiDung: AUTHOR_FIELDS },
  });
}

module.exports = { getCommentsByImageId, createComment };
