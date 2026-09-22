const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt");

const SALT_ROUNDS = 10;

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  hoTen: true,
  tuoi: true,
  anhDaiDien: true,
};

async function register({ email, matKhau, hoTen, tuoi, anhDaiDien }) {
  if (!email || !matKhau || !hoTen) {
    throw new ApiError(400, "email, matKhau và hoTen là bắt buộc");
  }

  const existing = await prisma.nguoiDung.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email đã được sử dụng");
  }

  const hashedPassword = await bcrypt.hash(matKhau, SALT_ROUNDS);

  const user = await prisma.nguoiDung.create({
    data: {
      email,
      matKhau: hashedPassword,
      hoTen,
      tuoi: tuoi != null ? Number(tuoi) : undefined,
      anhDaiDien,
    },
    select: PUBLIC_USER_FIELDS,
  });

  const token = signToken({ userId: user.id, email: user.email });

  return { user, token };
}

async function login({ email, matKhau }) {
  if (!email || !matKhau) {
    throw new ApiError(400, "email và matKhau là bắt buộc");
  }

  const user = await prisma.nguoiDung.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  const isMatch = await bcrypt.compare(matKhau, user.matKhau);
  if (!isMatch) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  const token = signToken({ userId: user.id, email: user.email });

  const { matKhau: _omit, ...publicUser } = user;

  return { user: publicUser, token };
}

module.exports = { register, login };
