-- CreateTable
CREATE TABLE "Avatar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nftAddressWithTokenId" TEXT NOT NULL DEFAULT '',
    "nftAddress" TEXT NOT NULL DEFAULT '',
    "tokenId" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "symbol" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "gltUrl" TEXT NOT NULL DEFAULT '',
    "vrmUrl" TEXT NOT NULL DEFAULT '',
    "hair" TEXT NOT NULL DEFAULT '',
    "face" TEXT NOT NULL DEFAULT '',
    "top" TEXT NOT NULL DEFAULT '',
    "middle" TEXT NOT NULL DEFAULT '',
    "side" TEXT NOT NULL DEFAULT '',
    "bottom" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "body_top" TEXT NOT NULL DEFAULT '',
    "body_bottom" TEXT NOT NULL DEFAULT '',
    "background" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_nftAddressWithTokenId_key" ON "Avatar"("nftAddressWithTokenId");
