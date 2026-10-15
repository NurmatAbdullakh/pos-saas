
import { pool } from "./pool.js";

async function main() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    console.log("PostgreSQL connected!");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();