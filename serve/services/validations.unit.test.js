import { beaconAuth, hasFile, validateContribution } from './validations';
import { zKey } from 'snarkjs';

vi.mock('snarkjs', () => {
  return {
    zKey: { verifyFromR1cs: vi.fn() },
  };
});

describe('Route validation tests', () => {
  let res;
  let req = {
    files: null,
  };
  let next;

  beforeAll(async () => {
    res = {
      status: vi
        .fn(code => {
          console.log(code);
        })
        .mockReturnThis(),
      send: vi.fn(),
    };
    next = vi.fn();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('Should validate AUTH_KEY', async () => {
    // Unhappy path
    req = {
      headers: {
        'x-app-token': 'invalidtoken',
      },
    };
    beaconAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();

    // Happy path
    req.headers['x-app-token'] = process.env.AUTH_KEY;
    beaconAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('Should check if contribution contains a file', () => {
    // Unhappy path
    hasFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    // Happy path
    req.files = Buffer.from('file', 'utf-8');
    hasFile(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('Should validate a contribution', async () => {
    await validateContribution({ circuit: 'deposit', contribData: 'data' });
    expect(zKey.verifyFromR1cs).toHaveBeenCalled();
  });
});
