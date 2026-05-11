-- CreateTable
CREATE TABLE "sender_profiles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_name" TEXT,
    "title" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "logo_url" TEXT,
    "sender_id" TEXT,
    "signature" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sender_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sender_profiles_uuid_key" ON "sender_profiles"("uuid");

-- CreateIndex
CREATE INDEX "sender_profiles_user_uuid_idx" ON "sender_profiles"("user_uuid");

-- AddForeignKey
ALTER TABLE "sender_profiles" ADD CONSTRAINT "sender_profiles_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
