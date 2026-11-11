export async function up(pgm) {
  // Gateway request IDs replace the old bot/chat-based OTP flow.
  pgm.addColumn("phone_auth_challenges", {
    gateway_request_id: { type: "varchar(128)" },
  });
  pgm.createIndex("phone_auth_challenges", "gateway_request_id", {
    name: "phone_auth_challenges_gateway_request_id_unique",
    unique: true,
    where: "gateway_request_id IS NOT NULL",
  });

  // Invalidate pending challenges created by the obsolete bot-based flow.
  pgm.sql("UPDATE phone_auth_challenges SET consumed_at = NOW() WHERE consumed_at IS NULL");

  // These tables belonged only to the obsolete Telegram Bot API contact-link flow.
  pgm.dropTable("telegram_pending_links", { ifExists: true });
  pgm.dropTable("telegram_accounts", { ifExists: true });
  pgm.dropColumn("phone_auth_challenges", [
    "otp_hash",
    "link_token_hash",
    "telegram_user_id",
    "telegram_chat_id",
    "resend_after",
    "contact_verified_at",
  ]);
}

export async function down(pgm) {
  pgm.addColumn("phone_auth_challenges", {
    otp_hash: { type: "varchar(64)" },
    link_token_hash: { type: "varchar(64)" },
    telegram_user_id: { type: "bigint" },
    telegram_chat_id: { type: "bigint" },
    resend_after: { type: "timestamptz" },
    contact_verified_at: { type: "timestamptz" },
  });
  pgm.createTable("telegram_accounts", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    telegram_user_id: { type: "bigint", notNull: true, unique: true },
    chat_id: { type: "bigint", notNull: true },
    verified_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("telegram_accounts", "telegram_accounts_user_id_unique", { unique: ["user_id"] });
  pgm.createTable("telegram_pending_links", {
    telegram_user_id: { type: "bigint", primaryKey: true },
    chat_id: { type: "bigint", notNull: true },
    token_hash: { type: "varchar(64)", notNull: true },
    expires_at: { type: "timestamptz", notNull: true },
  });
  // Dropping the column also removes its dependent index.
  pgm.dropColumn("phone_auth_challenges", "gateway_request_id");
}
