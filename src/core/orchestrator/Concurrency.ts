/**
 * Runs `worker` over `items` with at most `limit` running at once and keeps the
 * input order in the result. Used for per-learner work (LLM_CONCURRENCY).
 */
export async function mapWithLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  const runLane = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index] as T);
    }
  };

  const laneCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: laneCount }, runLane));
  return results;
}
