import type { Prisma } from "@/generated/prisma/client";
import { getEmailValidationAdapter } from "@/adapters";
import type { CheckEmailSource } from "@/constants/reacher";
import { CheckEmailSource as Sources } from "@/constants/reacher";
import { EmailHelper } from "@/helpers/email";
import { ReachableHelper } from "@/helpers/reachable";
import { ValidationCheckRepository } from "@/repositories/validation-check";
import { UserService } from "@/services/user";
import type { CheckEmailResponse } from "@/types/api";

export class ValidationService {
  static async checkEmail(params: {
    clerkId: string;
    emailAddress: string;
    toEmail: string;
    sync?: boolean;
  }): Promise<CheckEmailResponse> {
    const email = EmailHelper.normalize(params.toEmail);
    if (!EmailHelper.isValidSyntax(email)) {
      throw new Error("Invalid email address");
    }

    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );

    const source: CheckEmailSource = params.sync
      ? Sources.V0
      : Sources.V1;

    const adapter = getEmailValidationAdapter();
    const result = await adapter.checkEmail(email, source);
    const isReachable = ReachableHelper.normalize(result.is_reachable);

    const check = await ValidationCheckRepository.create({
      userId: user.id,
      email,
      isReachable,
      rawResult: result as Prisma.InputJsonValue,
      source,
    });

    return {
      email,
      isReachable,
      source,
      result,
      checkId: check.id,
    };
  }
}
