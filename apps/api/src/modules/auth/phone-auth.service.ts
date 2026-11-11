import { UnauthorizedError } from "../../shared/errors.js";
import { phoneAuthRepository } from "./phone-auth.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";
import { telegramService } from "./telegram.service.js";

const OTP_TTL_MS=5*60*1000, RESEND_COOLDOWN_MS=60*1000, REFRESH_TTL_MS=7*24*60*60*1000;

export const phoneAuthService = {
  async requestOtp(phoneNumber: string) {
    const linked=await phoneAuthRepository.findTelegramAccount(phoneNumber);
    const otp=linked ? telegramService.generateOtp() : null;
    const linkToken=linked ? null : telegramService.generateLinkToken();
    const challengeId=await phoneAuthRepository.createChallenge({
      phoneNumber, otpHash:otp ? telegramService.hash(otp):null,
      linkTokenHash:linkToken ? telegramService.hash(linkToken):null,
      expiresAt:new Date(Date.now()+OTP_TTL_MS), resendAfter:new Date(Date.now()+RESEND_COOLDOWN_MS),
      telegramUserId:linked?.telegram_user_id ?? null, telegramChatId:linked?.chat_id ?? null,
      contactVerified:Boolean(linked),
    });
    if(linked && otp) {
      await telegramService.sendOtp(Number(linked.chat_id),otp);
      return {challengeId,status:"otp_sent" as const,expiresIn:300};
    }
    return {challengeId,status:"awaiting_telegram" as const,telegramUrl:telegramService.getStartLink(linkToken!),expiresIn:300};
  },

  async handleTelegramUpdate(update: any) {
    const message=update?.message;
    if(!message?.chat?.id || !message?.from?.id) return;
    const textValue: string=typeof message.text==="string" ? message.text:"";
    const startToken=textValue.match(/^\/start\s+([A-Za-z0-9_-]{20,})$/)?.[1];
    if(startToken) {
      await phoneAuthRepository.savePendingLink(Number(message.from.id),Number(message.chat.id),telegramService.hash(startToken));
      await telegramService.askForContact(Number(message.chat.id));
      return;
    }
    const contact=message.contact;
    if(!contact?.phone_number || !contact?.user_id || Number(contact.user_id)!==Number(message.from.id)) return;
    const phoneNumber=normalizePhone(contact.phone_number);
    const pending=await phoneAuthRepository.getPendingLink(Number(message.from.id));
    if(!pending) return;
    const challengeId=await phoneAuthRepository.bindTelegramContact({
      tokenHash:pending.token_hash,phoneNumber,telegramUserId:Number(message.from.id),chatId:Number(message.chat.id),
    });
    if(!challengeId) return;
    await phoneAuthRepository.deletePendingLink(Number(message.from.id));
    const otp=telegramService.generateOtp();
    await phoneAuthRepository.setOtp(challengeId,telegramService.hash(otp),
      new Date(Date.now()+OTP_TTL_MS),new Date(Date.now()+RESEND_COOLDOWN_MS));
    await telegramService.sendOtp(Number(message.chat.id),otp);
  },

  async verifyOtp(input:{challengeId:string;phoneNumber:string;code:string}) {
    const challenge=await phoneAuthRepository.findChallenge(input.challengeId);
    if(!challenge || challenge.phone_number!==input.phoneNumber || !challenge.otp_hash ||
       !challenge.telegram_user_id || !challenge.telegram_chat_id || challenge.attempts>=5 ||
       challenge.expires_at.getTime()<=Date.now() || challenge.consumed_at) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }
    if(telegramService.hash(input.code)!==challenge.otp_hash) {
      await phoneAuthRepository.incrementAttempt(challenge.id);
      throw new UnauthorizedError("Invalid or expired verification code");
    }
    const refreshToken=refreshTokenService.generate();
    const user=await phoneAuthRepository.consumeAndCreateSession({
      challengeId:challenge.id,otpHash:challenge.otp_hash,phoneNumber:input.phoneNumber,
      telegramUserId:challenge.telegram_user_id,chatId:challenge.telegram_chat_id,
      refreshTokenHash:refreshTokenService.hash(refreshToken),
      refreshExpiresAt:new Date(Date.now()+REFRESH_TTL_MS),
    });
    if(!user) throw new UnauthorizedError("Invalid or expired verification code");
    return {
      user:{id:user.id,name:user.name,email:user.email,created_at:user.created_at,authProvider:"password" as const},
      accessToken:tokenService.sign(user.id,"password"),refreshToken,
    };
  },
};

function normalizePhone(value:string):string {
  const digits=value.replace(/[^\d+]/g,"");
  if(digits.startsWith("+")) return digits;
  if(digits.startsWith("00")) return `+${digits.slice(2)}`;
  return `+${digits}`;
}
