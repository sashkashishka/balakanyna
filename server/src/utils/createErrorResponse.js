export function createErrorResponse(err) {
  return {
    error: err?.code || err?.name || 'Unknown',
    message: err?.message || 'Unknown message',
  };
}
