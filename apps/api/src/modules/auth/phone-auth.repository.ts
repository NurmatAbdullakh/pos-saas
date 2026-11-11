import { pool } from "../../db/pool.js";

export interface PhoneChallenge {
  id: string;
  phone_number: string;
  gateway_request_id: string;
  expires_at: Date;
  attempts: number;
  consumed_at: Date | null;
}

export const phoneAuthRepository = {
  async countRecentChallenges(phoneNumber: string) {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM phone_auth_challenges WHERE phone_number=$1 AND created_at > NOW() - INTERVAL '15 minutes'",
      [phoneNumber],
    );
    return result.rows[0].count as number;
  },

  async createChallenge(input: {
    phoneNumber: string;
    gatewayRequestId: string;
    expiresAt: Date;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE phone_auth_challenges SET consumed_at=NOW() WHERE phone_number=$1 AND consumed_at IS NULL",
        [input.phoneNumber],
      );
      const result = await client.query(
        `INSERT INTO phone_auth_challenges
         (phone_number, gateway_request_id, expires_at)
         VALUES ($1,$2,$3) RETURNING id`,
        [input.phoneNumber, input.gatewayRequestId, input.expiresAt],
      );
      await client.query("COMMIT");
      return result.rows[0].id as string;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async findChallenge(id: string): Promise<PhoneChallenge | null> {
    const result = await pool.query<PhoneChallenge>(
      `SELECT id, phone_number, gateway_request_id, expires_at, attempts, consumed_at
       FROM phone_auth_challenges WHERE id=$1 LIMIT 1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async incrementAttempt(id: string) {
    await pool.query(
      `UPDATE phone_auth_challenges SET attempts=attempts+1
       WHERE id=$1 AND consumed_at IS NULL AND attempts < 5`,
      [id],
    );
  },

  async consumeAndCreateSession(input: {
    challengeId: string;
    phoneNumber: string;
    refreshTokenHash: string;
    refreshExpiresAt: Date;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const challenge = await client.query(
        `SELECT id FROM phone_auth_challenges
         WHERE id=$1 AND phone_number=$2 AND expires_at > NOW()
           AND consumed_at IS NULL AND attempts < 5
         FOR UPDATE`,
        [input.challengeId, input.phoneNumber],
      );
      if (!challenge.rows[0]) {
        await client.query("ROLLBACK");
        return null;
      }

      let result = await client.query(
        `SELECT id,name,email,created_at FROM users WHERE phone_number=$1 FOR UPDATE`,
        [input.phoneNumber],
      );
      let user = result.rows[0];
      if (!user) {
        result = await client.query(
          `INSERT INTO users (name,email,password_hash,phone_number)
           VALUES ('POS SaaS user',NULL,NULL,$1) RETURNING id,name,email,created_at`,
          [input.phoneNumber],
        );
        user = result.rows[0];
      }

      await client.query(
        "UPDATE phone_auth_challenges SET consumed_at=NOW() WHERE id=$1",
        [input.challengeId],
      );
      await client.query(
        `INSERT INTO refresh_tokens (user_id,token_hash,expires_at,auth_provider)
         VALUES ($1,$2,$3,'password')`,
        [user.id,input.refreshTokenHash,input.refreshExpiresAt],
      );
      await client.query("COMMIT");
      return user as { id:string; name:string; email:string|null; created_at:Date };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
