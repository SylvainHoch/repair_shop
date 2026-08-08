let lastReference = 0;

/**
 * Produces a short, human-readable reference for a submission.
 *
 * This counter is scoped to the running application process. Connect it to a
 * persistent store before deploying on multiple instances or serverless hosts.
 */
export function createSubmissionReference(): string {
  lastReference += 1;
  return String(lastReference).padStart(5, "0");
}
