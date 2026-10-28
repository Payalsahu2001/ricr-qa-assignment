/**
 * Reference implementation created only because the evaluation PDF does not
 * include the real service or Prisma client. Replace the repository boundary
 * with the application's real Prisma client when integrating into that app.
 */
export type CallerRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  isActive: boolean;
  createdAt: Date;
};

export const prisma = {
  caller: {
    findUnique: async (_args: { where: { id: number } }): Promise<CallerRecord | null> => {
      throw new Error('Reference Prisma client: mock findUnique in tests');
    }
  }
};

export async function getCallerById(callerId: number): Promise<CallerRecord> {
  const caller = await prisma.caller.findUnique({ where: { id: callerId } });
  if (!caller) {
    throw new Error('Caller not found');
  }
  return caller;
}