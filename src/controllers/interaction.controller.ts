/**
 * Reference controller for the behaviour specified in the assignment.
 * The original application controller was not supplied in the PDF.
 */
export type InteractionBody = {
  studentId?: number;
  statusId?: number;
  remarks?: string;
  [key: string]: unknown;
};

export type InteractionRequest = {
  body: InteractionBody;
  user: { id: number; email: string; userType: number };
};

export type MockResponse = {
  status: (code: number) => MockResponse;
  json: (body: unknown) => MockResponse;
};

export const interactionService = {
  createInteraction: async (_body: InteractionBody, _userId: number): Promise<unknown> => {
    throw new Error('Reference service: mock createInteraction in tests');
  }
};

export async function createInteraction(req: InteractionRequest, res: MockResponse) {
  const { studentId, statusId, remarks } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID is required' });
  }
  if (!statusId) {
    return res.status(400).json({ success: false, message: 'Status ID is required' });
  }
  if (!remarks) {
    return res.status(400).json({ success: false, message: 'Remarks are required' });
  }

  try {
    const created = await interactionService.createInteraction(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Interaction logged',
      data: created
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ success: false, message });
  }
}