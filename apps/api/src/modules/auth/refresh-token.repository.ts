import type { PoolClient } from "pg";
import { pool } from "../../db/pool.js";
import type { AuthProvider } from "./token.service.js";
import type { RefreshToken, RefreshTokenRepository } from "./refresh-token.repository.interface.js";

export const refreshTokenRepository: RefreshTokenRepository = {
  async create({ userId, tokenHash, expiresAt, authProvider }) {
    const result = await pool.query<RefreshToken>(
      `INSERT INTO refresh_tokens (
         user_id, token_hash, expires_at, auth_provider
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         user_id AS "userId",
         token_hash AS "tokenHash",
         expires_at AS "expiresAt",
         revoked_at AS "revokedAt",
         created_at AS "createdAt",
         auth_provider AS "authProvider"`,
      [userId, tokenHash, expiresAt, authProvider],
    );

    return result.rows[0];
  },

  async findByTokenHash(tokenHash) {
    const result = await pool.query<RefreshToken>(
      `SELECT
         id,
         user_id AS "userId",
         token_hash AS "tokenHash",
         expires_at AS "expiresAt",
         revoked_at AS "revokedAt",
         created_at AS "createdAt",
         auth_provider AS "authProvider"
       FROM refresh_tokens
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash],
    );

    return result.rows[0] ?? null;
  },

  async revoke(tokenHash) {
    await pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash],
    );
  },

  async rotate({ oldTokenHash, newTokenHash, expiresAt }) {
    const client: PoolClient = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query<{
        id: string;
        user_id: string;
        auth_provider: AuthProvider;
      }>(
        `SELECT id, user_id, auth_provider
         FROM refresh_tokens
         WHERE token_hash = $1
           AND revoked_at IS NULL
           AND expires_at > NOW()
         FOR UPDATE`,
        [oldTokenHash],
      );

      const oldToken = result.rows[0];

      if (!oldToken) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE id = $1 AND revoked_at IS NULL`,
        [oldToken.id],
      );

      await client.query(
        `INSERT INTO refresh_tokens (
           user_id, token_hash, expires_at, auth_provider
         )
         VALUES ($1, $2, $3, $4)`,
        [oldToken.user_id, newTokenHash, expiresAt, oldToken.auth_provider],
      );

      await client.query("COMMIT");

      return {
        userId: oldToken.user_id,
        authProvider: oldToken.auth_provider,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
