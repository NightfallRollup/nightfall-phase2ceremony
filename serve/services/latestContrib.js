import AWS from 'aws-sdk';
import branchName from 'current-git-branch';

export async function getLatestContribution({ circuit }) {
  const s3 = new AWS.S3();
  const bucket = process.env.NODE_ENV === 'development' ? 'mpc-main' : `mpc-${branchName()}`;

  const list = await s3.listObjects({ Bucket: bucket, Prefix: `${circuit}` }).promise();
  const bucketData = list.Contents.filter(cont => cont.Key !== `${circuit}/`).sort(
    (a, b) => new Date(b.LastModified) - new Date(a.LastModified),
  );

  const object = await s3.getObject({ Bucket: bucket, Key: `${bucketData[0].Key}` }).promise();
  return object;
}
