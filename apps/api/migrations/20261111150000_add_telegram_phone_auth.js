export const shorthands = undefined;

export async function up(pgm) {
  pgm.addColumn("users", {
    phone_number: { type: "varchar(16)", notNull: false },
  });
  pgm.addConstraint("users", "users_phone_number_unique", { unique: ["phone_number"] });
  pgm.alterColumn("users", "email", { notNull: false });
  pgm.alterColumn("users", "password_hash", { notNull: false });

  pgm.createTable("telegram_accounts", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    telegram_user_id: { type: "bigint", notNull: true, unique: true },
    chat_id: { type: "bigint", notNull: true },
    verified_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("telegram_accounts", "telegram_accounts_user_id_unique", { unique: ["user_id"] });

  pgm.createTable("phone_auth_challenges", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    phone_number: { type: "varchar(16)", notNull: true },
    otp_hash: { type: "varchar(64)" },
    link_token_hash: { type: "varchar(64)" },
    telegram_user_id: { type: "bigint" },
    telegram_chat_id: { type: "bigint" },
    expires_at: { type: "timestamptz", notNull: true },
    resend_after: { type: "timestamptz" },
    attempts: { type: "integer", notNull: true, default: 0 },
    contact_verified_at: { type: "timestamptz" },
    consumed_at: { type: "timestamptz" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("phone_auth_challenges", "phone_number");
  pgm.createIndex("phone_auth_challenges", "expires_at");
}

export async function down(pgm) {
  pgm.dropTable("phone_auth_challenges");
  pgm.dropTable("telegram_accounts");
  pgm.dropConstraint("users", "users_phone_number_unique");
  pgm.dropColumn("users", "phone_number");
  pgm.alterColumn("users", "email", { notNull: true });
  pgm.alterColumn("users", "password_hash", { notNull: true });
}
