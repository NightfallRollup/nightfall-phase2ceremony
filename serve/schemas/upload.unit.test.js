import { uploadBeaconSchema, uploadContribSchema } from './upload.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Schema validation tests', () => {
  test('should validate an contribution upload schema', async () => {
    const valid = {
      name: 'somename',
      circuit: 'deposit',
    };
    expect(uploadContribSchema.validate(valid)).not.toHaveProperty('error');

    let invalid = {
      name: 'some name',
      circuit: 'deposit',
    };
    expect(uploadContribSchema.validate(invalid)).toHaveProperty('error');
    invalid = {};
    expect(uploadContribSchema.validate(invalid)).toHaveProperty('error');
    invalid = { circuit: 'deposit' };
    expect(uploadContribSchema.validate(invalid)).toHaveProperty('error');
  });

  test('should validate an beacon upload schema', async () => {
    const valid = {
      circuit: 'deposit',
    };
    expect(uploadBeaconSchema.validate(valid)).not.toHaveProperty('error');

    const invalid = {};
    expect(uploadBeaconSchema.validate(invalid)).toHaveProperty('error');
  });
});
