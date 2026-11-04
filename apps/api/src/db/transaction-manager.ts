import type { Pool, PoolClient } from "pg";

export class TransactionManager {
    constructor(private readonly pool: Pool) {}

    async run<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const result = await callback(client);

            await client.query("COMMIT");

            return result;
        } catch (error) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Transaction rollback failed:", rollbackError);
            }

            throw error;
        } finally {
            client.release();
        }
    }
}