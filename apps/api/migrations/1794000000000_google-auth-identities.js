export const up = (pgm) => {
  pgm.alterColumn("users", "password_hash", {
    type: "text",
    notNull: false,
  });

  pgm.addColumn("refresh_tokens", {
    auth_provider: {
      type: "varchar(30)",
      notNull: true,
      default: "password",
    },
  });

  pgm.createTable("user_identities", {
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
    provider: {
      type: "varchar(30)",
      notNull: true,
    },
    provider_user_id: {
      type: "varchar(255)",
      notNull: true,
    },
    provider_email: {
      type: "varchar(255)",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.addConstraint("user_identities", "user_identities_provider_subject_unique", {
    unique: ["provider", "provider_user_id"],
  });

  pgm.addConstraint("user_identities", "user_identities_user_provider_unique", {
    unique: ["user_id", "provider"],
  });

  pgm.createIndex("user_identities", "user_id", {
    name: "idx_user_identities_user_id",
  });
};

export const down = (pgm) => {
  pgm.dropTable("user_identities");
  pgm.dropColumn("refresh_tokens", "auth_provider");
  pgm.alterColumn("users", "password_hash", {
    type: "text",
    notNull: true,
  });
};
