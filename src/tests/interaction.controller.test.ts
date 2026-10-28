import {
  createInteraction,
  interactionService,
  InteractionRequest,
  MockResponse
} from '../controllers/interaction.controller';

// Spy on the service object used by the controller itself.
const serviceMock = jest.spyOn(interactionService, 'createInteraction');

function makeResponse() {
  const res = {
    status: jest.fn(),
    json: jest.fn()
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as MockResponse & { status: jest.Mock; json: jest.Mock };
}

function makeRequest(body: InteractionRequest['body']): InteractionRequest {
  return {
    body,
    user: { id: 1, email: 'qa@example.com', userType: 1 }
  };
}

describe('createInteraction controller', () => {
  beforeEach(() => serviceMock.mockReset());

  test('returns 400 when studentId is missing', async () => {
    const res = makeResponse();
    await createInteraction(makeRequest({ statusId: 2, remarks: 'Called' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Student ID is required' });
  });

  test('returns 400 when statusId is missing', async () => {
    const res = makeResponse();
    await createInteraction(makeRequest({ studentId: 5, remarks: 'Called' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Status ID is required' });
  });

  test('returns 400 when remarks is missing', async () => {
    const res = makeResponse();
    await createInteraction(makeRequest({ studentId: 5, statusId: 2 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Remarks are required' });
  });

  test('returns 201 and created record for valid input', async () => {
    const created = { id: 10, studentId: 5, statusId: 2, remarks: 'Called' };
    serviceMock.mockResolvedValue(created);
    const req = makeRequest({ studentId: 5, statusId: 2, remarks: 'Called' });
    const res = makeResponse();

    await createInteraction(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Interaction logged',
      data: created
    });
  });

  test('returns 500 when the service throws', async () => {
    serviceMock.mockRejectedValue(new Error('Service unavailable'));
    const res = makeResponse();
    await createInteraction(makeRequest({ studentId: 5, statusId: 2, remarks: 'Called' }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Service unavailable'
    });
  });

  test('calls service with request body and authenticated user id', async () => {
    serviceMock.mockResolvedValue({ id: 10 });
    const req = makeRequest({ studentId: 5, statusId: 2, remarks: 'Called' });
    await createInteraction(req, makeResponse());
    expect(serviceMock).toHaveBeenCalledWith(req.body, 1);
  });
});
