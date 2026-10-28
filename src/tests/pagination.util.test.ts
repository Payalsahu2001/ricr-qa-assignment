import { getPaginationMeta } from '../utils/pagination.util';

describe('getPaginationMeta', () => {
  test('standard case: first page of 100 records', () => {
    const result = getPaginationMeta(100, 1, 10);
    expect(result.totalPages).toBe(10);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(false);
  });

  test('last page has no next page', () => {
    const result = getPaginationMeta(100, 10, 10);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
  });

  test('middle page has both next and previous pages', () => {
    const result = getPaginationMeta(50, 3, 5);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(true);
  });

  test('partial last page rounds total pages up', () => {
    const result = getPaginationMeta(23, 3, 10);
    expect(result.totalPages).toBe(3);
    expect(result.hasNextPage).toBe(false);
  });

  test('single page has no next or previous page', () => {
    const result = getPaginationMeta(5, 1, 10);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  test('zero records gives zero pages', () => {
    const result = getPaginationMeta(0, 1, 10);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  test('returns all expected metadata fields', () => {
    expect(getPaginationMeta(23, 2, 10)).toEqual({
      total: 23,
      totalPages: 3,
      currentPage: 2,
      limit: 10,
      hasNextPage: true,
      hasPrevPage: true
    });
  });
});