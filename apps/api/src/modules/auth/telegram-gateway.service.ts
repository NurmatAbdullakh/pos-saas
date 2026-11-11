import { env } from "../../config/env.js";

const GATEWAY_API = "https://gatewayapi.telegram.org";

interface GatewayResponse<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

interface GatewayRequestStatus {
  request_id: string;
  phone_number: string;
  delivery_status?: { status: "sent" | "delivered" | "read" | "expired" | "revoked"; updated_at: number };
  verification_status?: {
    status: "code_valid" | "code_invalid" | "code_max_attempts_exceeded" | "expired";
    updated_at: number;
  };
}

async function gatewayRequest<T>(method: string, body: Record<string, string | number>) {
  if (!env.TELEGRAM_GATEWAY_TOKEN) {
    throw new Error("Telegram Gateway is not configured: TELEGRAM_GATEWAY_TOKEN is missing");
  }

  const response = await fetch(`${GATEWAY_API}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TELEGRAM_GATEWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  const payload = await response.json() as GatewayResponse<T>;
  if (!response.ok || !payload.ok || payload.result === undefined) {
    // Do not expose credentials or raw provider responses to API clients.
    throw new Error(`Telegram Gateway request failed (${method}): ${payload.error ?? response.statusText}`);
  }

  return payload.result;
}

export const telegramGatewayService = {
  sendVerificationMessage(phoneNumber: string) {
    return gatewayRequest<GatewayRequestStatus>("sendVerificationMessage", {
      phone_number: phoneNumber,
      code_length: 6,
      ttl: 300,
    });
  },

  checkVerificationStatus(requestId: string, code: string) {
    return gatewayRequest<GatewayRequestStatus>("checkVerificationStatus", {
      request_id: requestId,
      code,
    });
  },
};
