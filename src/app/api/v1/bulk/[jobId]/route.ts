import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireUser } from "@/lib/auth/protect";
import { BulkJobService, NotFoundError } from "@/services/bulk-job";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireUser(request);
    const { jobId } = await context.params;

    const result = await BulkJobService.getStatus({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      jobId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof NotFoundError) {
      return ApiErrorHelper.notFound(error.message);
    }
    return ApiErrorHelper.json(error, 502, "Failed to fetch bulk job status");
  }
}
