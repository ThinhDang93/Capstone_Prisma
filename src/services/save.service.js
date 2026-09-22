const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

async function checkSaved(imageId, nguoiDungId) {
  const record = await prisma.luuAnh.findUnique({
    where: { nguoiDungId_hinhId: { nguoiDungId: Number(nguoiDungId), hinhId: Number(imageId) } },
  });

  return { daLuu: Boolean(record) };
}

async function toggleSave(imageId, nguoiDungId) {
  const image = await prisma.hinhAnh.findUnique({ where: { id: Number(imageId) } });
  if (!image) {
    throw new ApiError(404, "Không tìm thấy ảnh");
  }

  const existing = await prisma.luuAnh.findUnique({
    where: { nguoiDungId_hinhId: { nguoiDungId: Number(nguoiDungId), hinhId: Number(imageId) } },
  });

  if (existing) {
    await prisma.luuAnh.delete({
      where: { nguoiDungId_hinhId: { nguoiDungId: Number(nguoiDungId), hinhId: Number(imageId) } },
    });
    return { daLuu: false };
  }

  await prisma.luuAnh.create({
    data: { nguoiDungId: Number(nguoiDungId), hinhId: Number(imageId) },
  });
  return { daLuu: true };
}

module.exports = { checkSaved, toggleSave };
