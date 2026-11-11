import { pool } from "../../db/pool.js";

export interface PhoneChallenge {
  id: string;
  phone_number: string;
  otp_hash: string | null;
  link_token_hash: string | null;
  telegram_user_id: string | null;
  telegram_chat_id: string | null;
  expires_at: Date;
  attempts: number;
  consumed_at: Date | null;
  contact_verified_at: Date | null;
}

export const phoneAuthRepository = {
  async findTelegramAccount(phoneNumber: string) {
    const result = await pool.query(
      `SELECT ta.telegram_user_id, ta.chat_id
       FROM telegram_accounts ta
       JOIN users u ON u.id = ta.user_id
       WHERE u.phone_number = $1
       LIMIT 1`,
      [phoneNumber],
    );
    return result.rows[0] as { telegram_user_id: string; chat_id: string } | undefined;
  },

  async createChallenge(input: {
    phoneNumber: string; otpHash: string | null; linkTokenHash: string | null;
    expiresAt: Date; resendAfter: Date | null;
  }) {
    const result = await pool.query(
      `INSERT INTO phone_auth_challenges
       (phone_number, otp_hash, link_token_hash, expires_at, resend_after)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [input.phoneNumber, input.otpHash, input.linkTokenHash, input.expiresAt, input.resendAfter],
    );
    return result.rows[0].id as string;
  },

  async bindTelegramContact(input: {
    tokenHash: string; phoneNumber: string; telegramUserId: number; chatId: number;
  }) {
    const result = await pool.query(
      `UPDATE phone_auth_challenges
       SET telegram_user_id = $3, telegram_chat_id = $4,
           contact_verified_at = NOW(), link_token_hash = NULL
       WHERE link_token_hash = $1 AND phone_number = $2
         AND expires_at > NOW() AND consumed_at IS NULL
       RETURNING id`,
      [input.tokenHash, input.phoneNumber, input.telegramUserId, input.chatId],
    );
    return result.rowCount === 1;
  },

  async findChallenge(id: string): Promise<PhoneChallenge | null> {
    const result = await pool.query<PhoneChallenge>(
      `SELECT * FROM phone_auth_challenges WHERE id = $1 LIMIT 1`, [id],
    );
    return result.rows[0] ?? null;
  },

  async setOtp(id: string, otpHash: string, expiresAt: Date, resendAfter: Date) {
    await pool.query(
      `UPDATE phone_auth_challenges
       SET otp_hash = $2, expires_at = $3, resend_after = $4, attempts = 0
       WHERE id = $1 AND consumed_at IS NULL`,
      [id, otpHash, expiresAt, resendAfter],
    );
  },

  async consumeAndCreateSession(input: {
    challengeId: string; otpHash: string; phoneNumber: string;
    telegramUserId: string; chatId: string; refreshTokenHash: string; refreshExpiresAt: Date;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const challenge = await client.query(
        `SELECT id FROM phone_auth_challenges
         WHERE id = $1 AND phone_number = $2 AND otp_hash = $3
           AND telegram_user_id = $4 AND telegram_chat_id = $5
           AND contact_verified_at IS NOT NULL AND expires_at > NOW()
           AND consumed_at IS NULL AND attempts < 5
         FOR UPDATE`,
        [input.challengeId, input.phoneNumber, input.otpHash, input.telegramUserId, input.chatId],
      );
      if (!challenge.rows[0]) {
        await client.query(
          `UPDATE phone_auth_challenges SET attempts = attempts + 1
           WHERE id = $1 AND consumed_at IS NULL AND attempts < 5`,
          [input.challengeId],
        );
        await client.query("COMMIT");
        return null;
      }

      let userResult = await client.query(
        `SELECT id, name, email, created_at FROM users WHERE phone_number = $1 FOR UPDATE`,
        [input.phoneNumber],
      );
      let user = userResult.rows[0];
      if (!user) {
        userResult = await client.query(
          `INSERT INTO users (name, email, password_hash, phone_number)
           VALUES ('POS SaaS user', NULL, NULL, $1)
           RETURNING id, name, email, created_at`,
          [input.phoneNumber],
        );
        user = userResult.rows[0];
      }

      await client.query(
        `INSERT INTO telegram_accounts (user_id, telegram_user_id, chat_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE
         SET telegram_user_id = EXCLUDED.telegram_user_id,
             chat_id = EXCLUDED.chat_id, verified_at = NOW()`,
        [user.id, input.telegramUserId, input.chatId],
      );
      await client.query(
        `UPDATE phone_auth_challenges SET consumed_at = NOW()
         WHERE id = $1 AND consumed_at IS NULL`, [input.challengeId],
      );
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, auth_provider)
         VALUES ($1, $2, $3, 'password')`,
        [user.id, input.refreshTokenHash, input.refreshExpiresAt],
      );
      await client.query("COMMIT");
      return user as { id: string; name: string; email: string | null; created_at: Date };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
