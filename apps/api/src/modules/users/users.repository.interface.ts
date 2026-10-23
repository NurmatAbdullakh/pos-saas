export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  createdAt: Date;
}
export interface UserRepository {
  create(input: Pick<User, "email" | "name" | "password_hash"> ): Promise<Pick<User, "name" | "email" | "id">>,
  findUserByEmail(email:string): Promise<User | null>
}