import { id } from "../../shared/types.js";
import type { AuthProvider } from "./token.service.js";

export type RefreshTokenCreateInput = {
  userId: id;
  tokenHash: string;
  expiresAt: Date;
  authProvider: AuthProvider;
};

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  authProvider: AuthProvider;
}

export interface RotateInput {
  oldTokenHash: string;
  newTokenHash: string;
  expiresAt: Date;
}

export interface RotateResult {
  userId: string;
  authProvider: AuthProvider;
}

export interface RefreshTokenRepository {
  create(input: RefreshTokenCreateInput): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(tokenHash: string): Promise<void>;
  rotate(input: RotateInput): Promise<RotateResult | null>;
}
