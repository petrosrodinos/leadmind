CREATE TABLE "contact_lists" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_list_members" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "list_uuid" TEXT NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_list_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contact_lists_uuid_key" ON "contact_lists"("uuid");

CREATE INDEX "contact_lists_user_uuid_idx" ON "contact_lists"("user_uuid");

CREATE UNIQUE INDEX "contact_list_members_uuid_key" ON "contact_list_members"("uuid");

CREATE INDEX "contact_list_members_list_uuid_idx" ON "contact_list_members"("list_uuid");

CREATE INDEX "contact_list_members_contact_uuid_idx" ON "contact_list_members"("contact_uuid");

CREATE UNIQUE INDEX "contact_list_members_list_uuid_contact_uuid_key" ON "contact_list_members"("list_uuid", "contact_uuid");

ALTER TABLE "contact_lists" ADD CONSTRAINT "contact_lists_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_list_members" ADD CONSTRAINT "contact_list_members_list_uuid_fkey" FOREIGN KEY ("list_uuid") REFERENCES "contact_lists"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_list_members" ADD CONSTRAINT "contact_list_members_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
