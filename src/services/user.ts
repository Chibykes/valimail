import { UserRepository } from "@/repositories/user";

export class UserService {
  static async ensureUser(clerkId: string, email: string) {
    return UserRepository.upsertByClerkId(clerkId, email);
  }
}
