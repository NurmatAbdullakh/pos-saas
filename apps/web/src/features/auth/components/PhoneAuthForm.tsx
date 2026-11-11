import { useState, type FormEvent } from "react";
import { requestPhoneOtp, verifyPhoneOtp } from "../api/auth.api";
import type { AuthResponse } from "../types/auth.types";

interface Props { onAuthenticated: (response: AuthResponse) => void; }

export function PhoneAuthForm({ onAuthenticated }: Props) {
  const [phoneNumber,setPhoneNumber]=useState("+998");
  const [code,setCode]=useState("");
  const [challenge,setChallenge]=useState<{challengeId:string;expiresIn:number}|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function start(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { setChallenge(await requestPhoneOtp(phoneNumber.trim())); }
    catch(cause) { setError(cause instanceof Error ? cause.message : "OTP yuborilmadi."); }
    finally { setLoading(false); }
  }

  async function verify(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!challenge) return;
    setLoading(true); setError("");
    try {
      const response=await verifyPhoneOtp({challengeId:challenge.challengeId,phoneNumber:phoneNumber.trim(),code});
      onAuthenticated(response);
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Kod tasdiqlanmadi."); }
    finally { setLoading(false); }
  }

  return (
    <section className="phone-auth">
      <div className="divider"><span>OR CONTINUE WITH PHONE</span></div>
      {!challenge ? (
        <form className="phone-auth-form" onSubmit={(event)=>void start(event)}>
          <label htmlFor="phone-number">Phone number</label>
          <input id="phone-number" type="tel" autoComplete="tel" placeholder="+998901234567"
            value={phoneNumber} onChange={(event)=>setPhoneNumber(event.target.value)} disabled={loading} required />
          <button className="login-submit-button" type="submit" disabled={loading}>
            {loading ? "Please wait…" : "Continue with Telegram"}
          </button>
        </form>
      ) : (
        <form className="phone-auth-form" onSubmit={(event)=>void verify(event)}>
          <p className="phone-auth-hint">
            Tasdiqlash kodi Telegram ilovasidagi Verification Codes chatiga yuborildi.
            Kod {Math.floor(challenge.expiresIn / 60)} daqiqa amal qiladi.
          </p>
          <label htmlFor="phone-otp">Verification code</label>
          <input id="phone-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={8}
            placeholder="000000" value={code} onChange={(event)=>setCode(event.target.value.replace(/\D/g,""))}
            disabled={loading} required />
          <button className="login-submit-button" type="submit" disabled={loading || code.length<4 || code.length>8}>
            {loading ? "Verifying…" : "Verify and sign in"}
          </button>
          <button className="phone-back-button" type="button" onClick={()=>{setChallenge(null);setCode("");setError("");}}>
            Change phone number
          </button>
        </form>
      )}
      {error && <p className="error-message" role="alert">{error}</p>}
    </section>
  );
}
