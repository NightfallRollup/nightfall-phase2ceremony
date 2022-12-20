import { getLatestContribution } from './latestContrib';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const AWS = require('aws-sdk-mock');
import { DateTime } from 'luxon';

AWS.setSDKInstance(require('aws-sdk'));

beforeAll(() => {
  AWS.mock('S3', 'getObject', ({ Key }) => {
    return new Promise(resolve => resolve(Buffer.from(Key, 'utf-8')));
  });
  AWS.mock('S3', 'listObjects', ({ Bucket, Prefix }) => {
    const now = DateTime.now().endOf('day').toISO();
    const weekAgo = DateTime.now().minus({ weeks: 1 }).endOf('day').toISO();
    return new Promise(resolve =>
      resolve({
        Contents: [
          { Key: 'deposit/deposit_0001.zkey', LastModified: now },
          { Key: 'deposit/deposit_0000.zkey', LastModified: weekAgo },
        ],
      }),
    );
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('Should get latest contribution', async () => {
  const res = await getLatestContribution({ circuit: 'deposit' });
  const strBuff = res.toString();
  expect(strBuff).toBe('deposit/deposit_0001.zkey');
});

afterAll(() => {
  AWS.restore('S3');
});
