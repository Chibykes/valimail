import type { Prisma } from "@/generated/prisma/client";
import { getEmailValidationAdapter } from "@/adapters";
import type { CheckEmailSource } from "@/constants/reacher";
import { CheckEmailSource as Sources } from "@/constants/reacher";
import { CreditReason } from "@/constants/billing";
import { EmailHelper } from "@/helpers/email";
import { ReachableHelper } from "@/helpers/reachable";
import { CreditRepository } from "@/repositories/credit";
import { ValidationCheckRepository } from "@/repositories/validation-check";
import { UserService } from "@/services/user";
import { RECENT_CHECKS_PAGE_SIZE } from "@/constants/validation";
import type { CheckEmailResponse, RecentChecksResponse } from "@/types/api";

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

    await CreditRepository.spend({
      userId: user.id,
      cost: 1,
      reason: CreditReason.SINGLE,
    });

    const adapter = getEmailValidationAdapter();
    let result;
    try {
      result = await adapter.checkEmail(email, source);
    } catch (error) {
      await CreditRepository.refund({ userId: user.id, amount: 1 }).catch(
        (refundError) => {
          console.error("[check-email] refund failed", {
            message:
              refundError instanceof Error ? refundError.message : "unknown",
          });
        },
      );
      throw error;
    }
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

  static async listRecent(params: {
    clerkId: string;
    emailAddress: string;
  }): Promise<RecentChecksResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );
    const checks = await ValidationCheckRepository.listForUser(
      user.id,
      RECENT_CHECKS_PAGE_SIZE,
    );

    return {
      checks: checks.map((check) => ({
        id: check.id,
        email: check.email,
        isReachable: check.isReachable,
        source: check.source,
        createdAt: check.createdAt.toISOString(),
      })),
    };
  }
}
