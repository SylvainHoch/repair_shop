import { randomUUID } from "node:crypto";

/**
 * Produces a globally unique reference for a submission.
 */
export function createSubmissionReference(): string {
  return `SUB-${randomUUID()}`;
}
