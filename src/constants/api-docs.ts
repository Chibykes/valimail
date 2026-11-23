import { API_KEY_PREFIX } from "@/constants/validation";

export const API_KEY_PLACEHOLDER = `${API_KEY_PREFIX}YOUR_KEY`;

export const AGENT_INTEGRATION_PROMPT = `You are integrating the Valimail email validation API into this project.

Base URL: the Valimail origin. Local default is http://localhost:4455.
Authentication: send either header
  Authorization: Bearer <key>
  x-api-key: <key>
Read the key from the environment variable VALIMAIL_API_KEY. Do not hardcode it. Do not log it. Keys start with ${API_KEY_PREFIX} and are created in the Valimail dashboard. The secret is shown only once and cannot be fetched again.

Endpoints:

1. POST /api/v1/check-email
   Body: { "to_email": "person@example.com" }
   Query sync=1 uses the synchronous v0 check. The default is the queued v1 check.
   200: { "email", "isReachable", "source", "result", "checkId" }
   isReachable and result.is_reachable are one of: safe, risky, invalid, unknown.

2. POST /api/v1/bulk
   Body: { "input": ["a@example.com", "b@example.com"], "name": "optional list name" }
   201: { "jobId", "reacherJobId", "status" }

3. GET /api/v1/bulk/{jobId}
   Poll until status is "Completed".
   Response includes totalRecords, totalProcessed, and summary { safe, risky, invalid, unknown }.

4. GET /api/v1/bulk/{jobId}/results
   Call after the job is Completed.
   Response: { "jobId", "results": [{ "email", "isReachable", "raw" }] }

Errors are JSON { "error": string, "details"?: unknown }.
401 means the key is missing, revoked, or does not start with ${API_KEY_PREFIX}.
`;

export const API_DOC_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/check-email",
    title: "Check one address",
    body: `{
  "to_email": "person@example.com"
}`,
    notes:
      "Add ?sync=1 for a synchronous v0 check. The default queues the check on v1. isReachable is safe, risky, invalid, or unknown.",
    status: 200,
    response: `{
  "email": "person@example.com",
  "isReachable": "safe",
  "source": "v1",
  "checkId": "cm123abc",
  "result": {
    "input": "person@example.com",
    "is_reachable": "safe",
    "syntax": {
      "address": "person@example.com",
      "domain": "example.com",
      "is_valid_syntax": true,
      "username": "person"
    },
    "mx": {
      "accepts_mail": true,
      "records": ["mx.example.com"]
    },
    "smtp": {
      "can_connect_smtp": true,
      "has_full_inbox": false,
      "is_catch_all": false,
      "is_deliverable": true,
      "is_disabled": false
    },
    "misc": {
      "is_disposable": false,
      "is_role_account": false
    }
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/bulk",
    title: "Start a list",
    body: `{
  "input": ["a@example.com", "b@example.com"],
  "name": "April list"
}`,
    notes: "name is optional. The response includes jobId. Poll that id until the job is completed.",
    status: 201,
    response: `{
  "jobId": "cm123abc",
  "reacherJobId": "42",
  "status": "Running"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/bulk/{jobId}",
    title: "Job status",
    body: null,
    notes:
      "Poll until status is Completed. summary counts safe, risky, invalid, and unknown addresses.",
    status: 200,
    response: `{
  "jobId": "cm123abc",
  "name": "April list",
  "reacherJobId": "42",
  "status": "Completed",
  "totalRecords": 2,
  "totalProcessed": 2,
  "summary": {
    "safe": 1,
    "risky": 0,
    "invalid": 1,
    "unknown": 0
  },
  "createdAt": "2026-04-01T12:00:00.000Z",
  "finishedAt": "2026-04-01T12:00:08.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/bulk/{jobId}/results",
    title: "Job results",
    body: null,
    notes: "Read this after the job is Completed. Each row has email, isReachable, and the raw verifier payload.",
    status: 200,
    response: `{
  "jobId": "cm123abc",
  "results": [
    {
      "email": "a@example.com",
      "isReachable": "safe",
      "raw": {
        "input": "a@example.com",
        "is_reachable": "safe",
        "smtp": { "is_deliverable": true, "is_catch_all": false }
      }
    },
    {
      "email": "b@example.com",
      "isReachable": "invalid",
      "raw": {
        "input": "b@example.com",
        "is_reachable": "invalid",
        "smtp": { "is_deliverable": false }
      }
    }
  ]
}`,
  },
] as const;
