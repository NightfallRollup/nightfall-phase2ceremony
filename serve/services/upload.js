import AWS from 'aws-sdk';
import branchName from 'current-git-branch';

export async function upload({ circuit, name, data, beacon = false }) {
  const s3 = new AWS.S3();
  const uploadParams = {
    Bucket: `mpc-${branchName()}`,
    Key: `${circuit}/${beacon ? 'beacon' : name}.zkey`,
    Body: data,
  };

  const res = await s3.putObject(uploadParams).promise();
  return res;
}
