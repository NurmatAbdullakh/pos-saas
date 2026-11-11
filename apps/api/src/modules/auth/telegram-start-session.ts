const sessions = new Map<number, { chatId: number; tokenHash: string }>();

export function bindStartSession(userId: number, chatId: number, tokenHash: string) {
  sessions.set(userId, { chatId, tokenHash });
}

export function takeStartSession(userId: number) {
  const session = sessions.get(userId);
  if (session) sessions.delete(userId);
  return session ?? null;
}
