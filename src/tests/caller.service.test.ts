import { getCallerById, prisma, CallerRecord } from '../services/caller.service';

// Spy on the exported Prisma boundary instead of mocking the entire service
// module. getCallerById closes over this same prisma object.
const findUniqueMock = jest.spyOn(prisma.caller, 'findUnique');

describe('getCallerById', () => {
  const caller: CallerRecord = {
    id: 1,
    name: 'Test Caller',
    email: 'caller@example.com',
    phone: '1234567890',
    roleId: 2,
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00.000Z')
  };

  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  test('returns caller record when found', async () => {
    findUniqueMock.mockResolvedValue(caller);
    await expect(getCallerById(1)).resolves.toEqual(caller);
  });

  test('throws Caller not found when database returns null', async () => {
    findUniqueMock.mockResolvedValue(null);
    await expect(getCallerById(1)).rejects.toThrow('Caller not found');
  });

  test('calls findUnique with the requested id', async () => {
    findUniqueMock.mockResolvedValue(caller);
    await getCallerById(42);
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: 42 } });
  });

  test('propagates database errors', async () => {
    findUniqueMock.mockRejectedValue(new Error('DB connection lost'));
    await expect(getCallerById(1)).rejects.toThrow('DB connection lost');
  });
});
