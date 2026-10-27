
exports.up = (pgm) => {
    pgm.createTable("business_memberships", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        default: pgm.func("gen_random_uuid()"),
      },
      business_id: {
        type: "uuid",
        notNull: true,
        references: "businesses",
        onDelete: "CASCADE",
      },
      user_id: {
        type: "uuid",
        notNull: true,
        references: "users",
        onDelete: "CASCADE",
      },
      role: {
        type: "varchar(30)",
        notNull: true,
      },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
    });
  
    pgm.addConstraint(
      "business_memberships",
      "business_memberships_business_user_unique",
      {
        unique: ["business_id", "user_id"],
      }
    );
  
    pgm.addConstraint(
      "business_memberships",
      "business_memberships_role_check",
      {
        check: "role IN ('owner', 'manager', 'cashier')",
      }
    );
  
    pgm.createIndex("business_memberships", "user_id", {
      name: "idx_business_memberships_user_id",
    });
  
    pgm.createIndex("business_memberships", "business_id", {
      name: "idx_business_memberships_business_id",
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable("business_memberships");
  };
  