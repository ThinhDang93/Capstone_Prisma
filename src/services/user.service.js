const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  hoTen: true,
  tuoi: true,
  anhDaiDien: true,
};

async function getMe(userId) {
  const user = await prisma.nguoiDung.findUnique({
    where: { id: Number(userId) },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new ApiError(404, "Không tìm thấy user");
  }

  return user;
}

async function updateMe(userId, { hoTen, tuoi, anhDaiDien }) {
  if (hoTen === undefined && tuoi === undefined && anhDaiDien === undefined) {
    throw new ApiError(400, "Cần ít nhất 1 trường để cập nhật: hoTen, tuoi, anhDaiDien");
  }

  const data = {};
  if (hoTen !== undefined) data.hoTen = hoTen;
  if (tuoi !== undefined) data.tuoi = tuoi === null ? null : Number(tuoi);
  if (anhDaiDien !== undefined) data.anhDaiDien = anhDaiDien;

  const user = await prisma.nguoiDung.update({
    where: { id: Number(userId) },
    data,
    select: PUBLIC_USER_FIELDS,
  });

  return user;
}

async function getSavedImages(userId) {
  const savedRows = await prisma.luuAnh.findMany({
    where: { nguoiDungId: Number(userId) },
    orderBy: { ngayLuu: "desc" },
    include: {
      hinhAnh: {
        include: { nguoiDung: { select: { id: true, hoTen: true, anhDaiDien: true } } },
      },
    },
  });

  return savedRows.map((row) => row.hinhAnh);
}

async function getCreatedImages(userId) {
  return prisma.hinhAnh.findMany({
    where: { nguoiDungId: Number(userId) },
    orderBy: { id: "desc" },
  });
}

module.exports = { getMe, updateMe, getSavedImages, getCreatedImages };
