# Telegram phone authentication setup

The phone sign-in flow uses the Telegram Bot API as an OTP delivery channel. The user must open the bot and share their own Telegram contact once before a phone number can be linked.

## Environment

Set these variables in the API environment:

```env
TELEGRAM_BOT_TOKEN=<token-from-BotFather>
TELEGRAM_BOT_USERNAME=<bot-username-without-@>
TELEGRAM_WEBHOOK_SECRET=<long-random-secret>
OTP_SECRET=<different-long-random-secret>
```

Keep both secrets private. Do not commit real values.

## Database migration

From `apps/api`, run:

```bash
npm run migrate:up
```

The migration adds nullable phone/email/password fields needed for phone-only accounts, plus Telegram account, pending deep-link and OTP challenge tables.

## Configure the Telegram webhook

The API must be publicly reachable over HTTPS. Configure the bot webhook once (replace placeholders):

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_API_HOST/api/auth/telegram/webhook",
    "secret_token": "YOUR_TELEGRAM_WEBHOOK_SECRET",
    "allowed_updates": ["message"]
  }'
```

The `secret_token` must exactly match `TELEGRAM_WEBHOOK_SECRET`. Telegram sends it in the `X-Telegram-Bot-Api-Secret-Token` header.

## API flow

1. `POST /api/auth/phone/request-otp` with `{ "phoneNumber": "+998901234567" }`.
2. For an unlinked number, open the returned `telegramUrl`, press Start, then share your own contact using the bot keyboard.
3. The bot verifies that Telegram's `contact.user_id` equals the sender's Telegram user ID and that the normalized contact phone matches the requested phone.
4. The bot sends a six-digit OTP. It expires after five minutes.
5. `POST /api/auth/phone/verify-otp` with `{ "challengeId": "...", "phoneNumber": "+998901234567", "code": "123456" }`.
6. The API creates or finds the user, links the Telegram account, creates the refresh-token session and returns an access token. Refresh token remains in the existing HttpOnly cookie.

For an already linked number, the OTP is sent directly to its linked Telegram chat.

## Security notes

- OTPs and deep-link tokens are stored as HMAC-SHA256 hashes, not plaintext.
- OTPs are single-use, expire after five minutes and are limited to five verification attempts.
- The Telegram webhook is protected by Telegram's secret-token header.
- A user must share their own Telegram contact; arbitrary contact forwarding is rejected.
- Apply edge/API rate limiting by IP and phone number before enabling this publicly. Do not log OTPs, bot tokens or raw deep-link tokens.
- Phone-only users currently receive a placeholder display name and can complete their profile later.
