-- CreateTable
CREATE TABLE "nguoi_dung" (
    "nguoi_dung_id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "mat_khau" VARCHAR(255) NOT NULL,
    "ho_ten" VARCHAR(150) NOT NULL,
    "tuoi" INTEGER,
    "anh_dai_dien" TEXT,

    CONSTRAINT "nguoi_dung_pkey" PRIMARY KEY ("nguoi_dung_id")
);

-- CreateTable
CREATE TABLE "hinh_anh" (
    "hinh_id" SERIAL NOT NULL,
    "ten_hinh" VARCHAR(200) NOT NULL,
    "duong_dan" TEXT NOT NULL,
    "mo_ta" TEXT,
    "nguoi_dung_id" INTEGER NOT NULL,

    CONSTRAINT "hinh_anh_pkey" PRIMARY KEY ("hinh_id")
);

-- CreateTable
CREATE TABLE "binh_luan" (
    "binh_luan_id" SERIAL NOT NULL,
    "nguoi_dung_id" INTEGER NOT NULL,
    "hinh_id" INTEGER NOT NULL,
    "ngay_binh_luan" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noi_dung" VARCHAR(1000) NOT NULL,

    CONSTRAINT "binh_luan_pkey" PRIMARY KEY ("binh_luan_id")
);

-- CreateTable
CREATE TABLE "luu_anh" (
    "nguoi_dung_id" INTEGER NOT NULL,
    "hinh_id" INTEGER NOT NULL,
    "ngay_luu" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "luu_anh_pkey" PRIMARY KEY ("nguoi_dung_id","hinh_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dung_email_key" ON "nguoi_dung"("email");

-- CreateIndex
CREATE INDEX "hinh_anh_ten_hinh_idx" ON "hinh_anh"("ten_hinh");

-- CreateIndex
CREATE INDEX "hinh_anh_nguoi_dung_id_idx" ON "hinh_anh"("nguoi_dung_id");

-- CreateIndex
CREATE INDEX "binh_luan_hinh_id_idx" ON "binh_luan"("hinh_id");

-- CreateIndex
CREATE INDEX "luu_anh_nguoi_dung_id_idx" ON "luu_anh"("nguoi_dung_id");

-- AddForeignKey
ALTER TABLE "hinh_anh" ADD CONSTRAINT "hinh_anh_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("nguoi_dung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "binh_luan" ADD CONSTRAINT "binh_luan_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("nguoi_dung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "binh_luan" ADD CONSTRAINT "binh_luan_hinh_id_fkey" FOREIGN KEY ("hinh_id") REFERENCES "hinh_anh"("hinh_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luu_anh" ADD CONSTRAINT "luu_anh_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("nguoi_dung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luu_anh" ADD CONSTRAINT "luu_anh_hinh_id_fkey" FOREIGN KEY ("hinh_id") REFERENCES "hinh_anh"("hinh_id") ON DELETE CASCADE ON UPDATE CASCADE;
