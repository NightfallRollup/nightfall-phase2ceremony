import AWS from 'aws-sdk';
import logger from '../utils/logger.js'

const bucket = 'mpc-main';

export async function getLatestContribution({ circuit }) {
  const s3 = new AWS.S3();

  const list = await s3.listObjects({ Bucket: bucket, Prefix: `${circuit}` }).promise();

  const bucketData = list.Contents.filter(cont => cont.Key !== `${circuit}/`).sort(
    (a, b) => new Date(b.LastModified) - new Date(a.LastModified),
  );

  if (! bucketData || ! bucketData[0]) {
    logger.warn({ msg: 'No lastest contribution found for circuit', circuit });
    return null;
  }

  const object = await s3.getObject({ Bucket: bucket, Key: `${bucketData[0].Key}` }).promise();

  return object;
}
