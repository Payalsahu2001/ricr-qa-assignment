/**
 * Calculates pagination metadata.
 *
 * Assumptions from the task:
 * - page is 1-based.
 * - limit is a positive number.
 * - total is zero or greater.
 */
export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    total,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0
  };
}
