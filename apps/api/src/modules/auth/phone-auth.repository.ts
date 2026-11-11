import { pool } from "../../db/pool.js";

export interface PhoneChallenge {
  id: string; phone_number: string; otp_hash: string | null;
  link_token_hash: string | null; telegram_user_id: string | null;
  telegram_chat_id: string | null; expires_at: Date; attempts: number;
  consumed_at: Date | null; contact_verified_at: Date | null;
}

export const phoneAuthRepository = {
  async findTelegramAccount(phoneNumber: string) {
    const result = await pool.query(
      `SELECT ta.telegram_user_id, ta.chat_id FROM telegram_accounts ta
       JOIN users u ON u.id = ta.user_id WHERE u.phone_number = $1 LIMIT 1`, [phoneNumber],
    );
    return result.rows[0] as { telegram_user_id: string; chat_id: string } | undefined;
  },

  async countRecentChallenges(phoneNumber: string) {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM phone_auth_challenges WHERE phone_number=$1 AND created_at > NOW() - INTERVAL '15 minutes'",
      [phoneNumber],
    );
    return result.rows[0].count as number;
  },

  async createChallenge(input: {
    phoneNumber: string; otpHash: string | null; linkTokenHash: string | null;
    expiresAt: Date; resendAfter: Date | null;
    telegramUserId?: string | null; telegramChatId?: string | null; contactVerified?: boolean;
  }) {
    await pool.query(
      "UPDATE phone_auth_challenges SET consumed_at=NOW() WHERE phone_number=$1 AND consumed_at IS NULL",
      [input.phoneNumber],
    );
    const result = await pool.query(
      `INSERT INTO phone_auth_challenges
       (phone_number, otp_hash, link_token_hash, expires_at, resend_after,
        telegram_user_id, telegram_chat_id, contact_verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $8 THEN NOW() ELSE NULL END)
       RETURNING id`,
      [input.phoneNumber,input.otpHash,input.linkTokenHash,input.expiresAt,input.resendAfter,
       input.telegramUserId ?? null,input.telegramChatId ?? null,input.contactVerified ?? false],
    );
    return result.rows[0].id as string;
  },

  async savePendingLink(userId: number, chatId: number, tokenHash: string) {
    await pool.query(
      `INSERT INTO telegram_pending_links (telegram_user_id, chat_id, token_hash, expires_at)
       VALUES ($1,$2,$3,NOW() + INTERVAL '5 minutes')
       ON CONFLICT (telegram_user_id) DO UPDATE
       SET chat_id=EXCLUDED.chat_id, token_hash=EXCLUDED.token_hash, expires_at=EXCLUDED.expires_at`,
      [userId, chatId, tokenHash],
    );
  },

  async getPendingLink(userId: number) {
    const result = await pool.query(
      `SELECT chat_id, token_hash FROM telegram_pending_links
       WHERE telegram_user_id=$1 AND expires_at > NOW()`, [userId],
    );
    return result.rows[0] as { chat_id: string; token_hash: string } | undefined;
  },

  async deletePendingLink(userId: number) {
    await pool.query(`DELETE FROM telegram_pending_links WHERE telegram_user_id=$1`, [userId]);
  },

  async bindTelegramContact(input: {
    tokenHash: string; phoneNumber: string; telegramUserId: number; chatId: number;
  }) {
    const result = await pool.query(
      `UPDATE phone_auth_challenges SET telegram_user_id=$3, telegram_chat_id=$4,
       contact_verified_at=NOW(), link_token_hash=NULL
       WHERE link_token_hash=$1 AND phone_number=$2 AND expires_at > NOW()
       AND consumed_at IS NULL RETURNING id`,
      [input.tokenHash,input.phoneNumber,input.telegramUserId,input.chatId],
    );
    return result.rows[0]?.id as string | undefined;
  },

  async findChallenge(id: string): Promise<PhoneChallenge | null> {
    const result = await pool.query<PhoneChallenge>(
      `SELECT * FROM phone_auth_challenges WHERE id=$1 LIMIT 1`, [id],
    );
    return result.rows[0] ?? null;
  },

  async setOtp(id: string, otpHash: string, expiresAt: Date, resendAfter: Date) {
    await pool.query(
      `UPDATE phone_auth_challenges SET otp_hash=$2, expires_at=$3, resend_after=$4, attempts=0
       WHERE id=$1 AND consumed_at IS NULL`, [id,otpHash,expiresAt,resendAfter],
    );
  },

  async incrementAttempt(id: string) {
    await pool.query(
      `UPDATE phone_auth_challenges SET attempts=attempts+1
       WHERE id=$1 AND consumed_at IS NULL AND attempts < 5`, [id],
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
        `SELECT id FROM phone_auth_challenges WHERE id=$1 AND phone_number=$2 AND otp_hash=$3
         AND telegram_user_id=$4 AND telegram_chat_id=$5 AND contact_verified_at IS NOT NULL
         AND expires_at > NOW() AND consumed_at IS NULL AND attempts < 5 FOR UPDATE`,
        [input.challengeId,input.phoneNumber,input.otpHash,input.telegramUserId,input.chatId],
      );
      if (!challenge.rows[0]) { await client.query("ROLLBACK"); return null; }

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
        `INSERT INTO telegram_accounts (user_id,telegram_user_id,chat_id) VALUES ($1,$2,$3)
         ON CONFLICT (user_id) DO UPDATE SET telegram_user_id=EXCLUDED.telegram_user_id,
         chat_id=EXCLUDED.chat_id,verified_at=NOW()`,
        [user.id,input.telegramUserId,input.chatId],
      );
      await client.query(`UPDATE phone_auth_challenges SET consumed_at=NOW() WHERE id=$1`,[input.challengeId]);
      await client.query(
        `INSERT INTO refresh_tokens (user_id,token_hash,expires_at,auth_provider)
         VALUES ($1,$2,$3,'password')`,
        [user.id,input.refreshTokenHash,input.refreshExpiresAt],
      );
      await client.query("COMMIT");
      return user as { id:string; name:string; email:string|null; created_at:Date };
    } catch (error) {
      await client.query("ROLLBACK"); throw error;
    } finally { client.release(); }
  },
};
