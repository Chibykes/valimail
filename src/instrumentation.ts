export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startBulkQueue } = await import("./instrumentation.node");
    await startBulkQueue();
  }
}
