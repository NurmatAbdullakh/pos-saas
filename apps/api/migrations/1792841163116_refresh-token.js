exports.up = (pgm) => {
    pgm.createTable("refresh_tokens", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        default: pgm.func("gen_random_uuid()"),
      },
      user_id: {
        type: "uuid",
        notNull: true,
        references: "users",
        onDelete: "CASCADE",
      },
      token_hash: {
        type: "text",
        notNull: true,
        unique: true,
      },
      expires_at: {
        type: "timestamptz",
        notNull: true,
      },
      revoked_at: {
        type: "timestamptz",
        notNull: false,
      },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
    });
  
    pgm.createIndex("refresh_tokens", "user_id", {
      name: "idx_refresh_tokens_user_id",
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable("refresh_tokens");
  };