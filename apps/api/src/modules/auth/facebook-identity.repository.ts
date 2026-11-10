import { pool } from "../../db/pool.js";
import { TransactionManager } from "../../db/transaction-manager.js";
import { ExistsError } from "../../shared/errors.js";

export interface FacebookUser {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

const transactionManager = new TransactionManager(pool);

async function findUserBySubject(providerUserId: string): Promise<FacebookUser | null> {
  const result = await pool.query<FacebookUser>(
    `SELECT u.id, u.name, u.email, u.created_at
     FROM user_identities ui
     JOIN users u ON u.id = ui.user_id
     WHERE ui.provider = 'facebook' AND ui.provider_user_id = $1
     LIMIT 1`,
    [providerUserId],
  );

  return result.rows[0] ?? null;
}

export const facebookIdentityRepository = {
  findUserBySubject,

  async createUserWithIdentity(input: {
    subject: string;
    email: string;
    name: string;
  }): Promise<FacebookUser> {
    try {
      return await transactionManager.run(async (client) => {
        const existingUser = await client.query(
          "SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1",
          [input.email],
        );

        if (existingUser.rowCount) {
          throw new ExistsError(
            "An account with this email already exists. Sign in with your existing method first.",
          );
        }

        const userResult = await client.query<FacebookUser>(
          `INSERT INTO users (name, email, password_hash)
           VALUES ($1, $2, NULL)
           RETURNING id, name, email, created_at`,
          [input.name, input.email],
        );

        const user = userResult.rows[0];

        await client.query(
          `INSERT INTO user_identities
             (user_id, provider, provider_user_id, provider_email)
           VALUES ($1, 'facebook', $2, $3)`,
          [user.id, input.subject, input.email],
        );

        return user;
      });
    } catch (error) {
      if (error instanceof ExistsError) throw error;

      const existingIdentity = await findUserBySubject(input.subject);
      if (existingIdentity) return existingIdentity;

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ExistsError(
          "An account with this email already exists. Sign in with your existing method first.",
        );
      }

      throw error;
    }
  },
};
