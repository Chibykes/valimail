import { CheckEmailSource, ReacherPaths } from "@/constants/reacher";
import type { HttpClient } from "@/adapters/http/http-client.interface";
import type { EmailValidationAdapter } from "./email-validation.interface";
import type {
  ReacherBulkCreateResponse,
  ReacherBulkResultsResponse,
  ReacherBulkStatusResponse,
  ReacherCheckEmailResult,
} from "@/types/reacher";

export class ReacherEmailValidationAdapter implements EmailValidationAdapter {
  constructor(private readonly http: HttpClient) {}

  async checkEmail(
    email: string,
    source: CheckEmailSource = CheckEmailSource.V1,
  ): Promise<ReacherCheckEmailResult> {
    const path =
      source === CheckEmailSource.V0
        ? ReacherPaths.CHECK_EMAIL_V0
        : ReacherPaths.CHECK_EMAIL_V1;

    return this.http.post<ReacherCheckEmailResult>(path, { to_email: email });
  }

  async createBulk(emails: string[]): Promise<ReacherBulkCreateResponse> {
    return this.http.post<ReacherBulkCreateResponse>(ReacherPaths.BULK, {
      input: emails.map((to_email) => ({ to_email })),
    });
  }

  async getBulkStatus(jobId: string): Promise<ReacherBulkStatusResponse> {
    return this.http.get<ReacherBulkStatusResponse>(
      ReacherPaths.bulkJob(jobId),
    );
  }

  async getBulkResults(jobId: string): Promise<ReacherBulkResultsResponse> {
    return this.http.get<ReacherBulkResultsResponse>(
      ReacherPaths.bulkResults(jobId),
    );
  }
}
