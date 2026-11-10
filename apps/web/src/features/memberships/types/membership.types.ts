export type MemberRole = "owner" | "manager" | "cashier";

export interface BusinessMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: MemberRole;
}

export interface CreateMemberInput {
  name: string;
  email: string;
  password: string;
  role: MemberRole;
}
