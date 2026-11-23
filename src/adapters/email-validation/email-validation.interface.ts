import type { CheckEmailSource } from "@/constants/reacher";
import type {
  ReacherBulkCreateResponse,
  ReacherBulkResultsResponse,
  ReacherBulkStatusResponse,
  ReacherCheckEmailResult,
} from "@/types/reacher";

export interface EmailValidationAdapter {
  checkEmail(
    email: string,
    source?: CheckEmailSource,
  ): Promise<ReacherCheckEmailResult>;
  createBulk(emails: string[]): Promise<ReacherBulkCreateResponse>;
  getBulkStatus(jobId: string): Promise<ReacherBulkStatusResponse>;
  getBulkResults(jobId: string): Promise<ReacherBulkResultsResponse>;
}
