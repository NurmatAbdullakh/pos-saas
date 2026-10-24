export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}
export interface UserRepository {
  create(input: Pick<User, "email" | "name" | "password_hash"> ): Promise<Pick<User, "name" | "email" | "id">>,
  findUserByProperty(property:string, value:string): Promise<User | null>,

}