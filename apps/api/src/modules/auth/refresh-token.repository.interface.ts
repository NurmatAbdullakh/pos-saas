import { id } from "../../shared/types.js"

export type RefreshTokenCreateInput = {
    userId: id,
    tokenHash: string,
    expiresAt: Date
}

export interface RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }
export interface RotateInput{
    oldTokenHash: string,
    newTokenHash: string,
    expiresAt: Date,
}
export interface RefreshTokenRepository {
    create(input:RefreshTokenCreateInput):Promise<RefreshToken>,
    findByTokenHash(tokenHash:string):Promise<RefreshToken | null>,
    revoke(tokenHash: string):Promise<void>,
    rotate(input:RotateInput):Promise<string | null> 
}