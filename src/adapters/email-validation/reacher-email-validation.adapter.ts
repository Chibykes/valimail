import {
  CheckEmailSource,
  REACHER_RESULTS_PAGE_SIZE,
  ReacherPaths,
} from "@/constants/reacher";
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
    const response = await this.http.post<{ job_id: string | number }>(
      ReacherPaths.BULK,
      { input: emails },
    );
    return { job_id: String(response.job_id) };
  }

  async getBulkStatus(jobId: string): Promise<ReacherBulkStatusResponse> {
    return this.http.get<ReacherBulkStatusResponse>(
      ReacherPaths.bulkJob(jobId),
    );
  }

  async getBulkResults(jobId: string): Promise<ReacherBulkResultsResponse> {
    const results: ReacherCheckEmailResult[] = [];

    for (let offset = 0; ; offset += REACHER_RESULTS_PAGE_SIZE) {
      const page = await this.http.get<ReacherBulkResultsResponse>(
        ReacherPaths.bulkResults(jobId),
        { params: { limit: REACHER_RESULTS_PAGE_SIZE, offset } },
      );
      const items = page.results ?? page.data ?? [];
      results.push(...items);
      if (items.length < REACHER_RESULTS_PAGE_SIZE) break;
    }

    return { results };
  }
}
