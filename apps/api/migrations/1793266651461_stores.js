
export async function up(pgm){
    pgm.createTable("stores", {
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
      name: {
        type: "varchar(150)",
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
  
    pgm.createIndex("stores", "business_id");
  }
  
  export async function down(pgm) {
    pgm.dropTable("stores");
  }