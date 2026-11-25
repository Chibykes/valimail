export async function startBulkQueue() {
  const phase = process.env.NEXT_PHASE;
  if (
    phase &&
    phase !== "phase-production-server" &&
    phase !== "phase-development-server"
  ) {
    return;
  }

  const { BulkQueueService } = await import("@/services/bulk-queue");
  BulkQueueService.start();
}
