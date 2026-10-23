import argon2 from "argon2";

export const passwordService = {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  },

  async verify(
    password_hash: string,
    password: string,
  ): Promise<boolean> {
    return argon2.verify(password_hash, password);
  },
};