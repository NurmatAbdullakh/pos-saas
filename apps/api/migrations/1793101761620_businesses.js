
exports.up = (pgm) => {
    pgm.createTable("businesses", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        default: pgm.func("gen_random_uuid()"),
      },
      name: {
        type: "varchar(150)",
        notNull: true,
      },
      created_by: {
        type: "uuid",
        notNull: true,
        references: "users",
        onDelete: "RESTRICT",
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
  
    pgm.createIndex("businesses", "created_by", {
      name: "idx_businesses_created_by",
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable("businesses");
  };
  