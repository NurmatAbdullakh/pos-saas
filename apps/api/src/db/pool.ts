
import { Pool } from "pg";

// Pool переиспользует подключения к PostgreSQL,
// вместо создания нового соединения для каждого запроса.
export const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "pos_saas_db",
  user: "nurmat",
  max: 10,
});