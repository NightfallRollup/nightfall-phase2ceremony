import AWS from 'aws-sdk';
import logger from '../utils/logger.js';

export async function upload({ circuit, name, data, beacon = false }) {
  const bucketName = `mpc-main`;
  const keyValue = `${circuit}/${beacon ? 'beacon' : name}.zkey`;

  logger.info({
    msg: 'Uploading contribution to s3 bucket',
    bucket: bucketName,
    key: keyValue
  });

  const s3 = new AWS.S3();
  const uploadParams = {
    Bucket: bucketName,
    Key: keyValue,
    Body: data,
  };

  await s3.putObject(uploadParams).promise();

  logger.info({
    msg: 'Upload to s3 done!',
    bucket: bucketName,
    key: keyValue
  });
}
