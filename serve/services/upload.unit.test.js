import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const AWS = require('aws-sdk-mock');
import { upload } from './upload';

AWS.setSDKInstance(require('aws-sdk'));

beforeAll(() => {
  AWS.mock('S3', 'putObject', UploadParams => {
    return new Promise(resolve => resolve('Uploaded'));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('Should upload latest contribution', async () => {
  const res = await upload({ circuit: 'deposit', name: 'test', data: 'test' });
  expect(res).toBe('Uploaded');
});

afterAll(() => {
  AWS.restore('S3');
});
