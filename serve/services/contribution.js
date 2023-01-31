import { zKey } from 'snarkjs';
import AWS from 'aws-sdk';
import logger from '../utils/logger.js'
import {
  validateContribution,
} from '../services/validations.js';
import { upload } from './upload.js';
import { isTokenValid, updateCircuitInToken } from '../utils/tokenContributionUtil.js';
import { CIRCUITS  } from '../utils/constants.js';

export async function applyBeaconContribution(req, token, circuit, data) {
  await applyContribution(req, token, circuit, data, '', true);
}

export async function applyUserContribution(req, token, circuit, name, data) {
  await applyContribution(req, token, circuit, data, name, false);
}

async function applyContribution(req, token, circuit, data, name, isBeacon) {

  if(! isTokenValid(token, req.app)) {
    throw new Error(`Invalid token: ${token}`);
  }

  if (! CIRCUITS.includes(circuit)) {
    throw new Error(`Invalid circuit: ${circuit}`);
  }

  const hasBeaconContribution = await isBeaconTheLatestContribution(circuit);
  if (hasBeaconContribution) {
    throw new Error(`A beacon contribution already exists for circuit: ${circuit}`);
  }

  /* 
   * If not a beacon contribution, changes the name to be in the format `${name_yyyy-mm-ddThh:MM:SS.mmmZ} so 
   * that if the same "name" does many contributions, the previous does not get overwritten.
   */
  const newName = !isBeacon ? `${name}_${new Date().toISOString()}` : 'beacon';

  logger.info({
    msg: 'Verifying contribution...',
    circuit,
    name: newName
  });

  // Then verify it before uploading
  const isContributionValid = await validateContribution({ circuit, contribData: data });
  if (! isContributionValid) {
    throw new Error({ msg: 'Contribution is not valid for circuit', circuit });
  }

  logger.info({
    msg: 'Contribution verified!',
    circuit,
    name: newName
  });

  // Upload it
  await upload({ circuit, name: newName, data: data });

  if (isBeacon) {
    await exportAndUploadVerificationKey(circuit, data);
  }

  updateCircuitInToken(req.app, circuit);
}

async function exportAndUploadVerificationKey(circuit, finalContributionData) {
  logger.info({ msg: 'Exporting verification key', circuit });

  const verificationKey = await zKey.exportVerificationKey(finalContributionData);

  await upload({ circuit, name: 'verification_key', data: JSON.stringify(verificationKey), fileExtension: 'json' });
}

export async function isBeaconTheLatestContribution(circuit) {
  const s3 = new AWS.S3();
  const bucket = 'nightfall-mpc';
  const list = await s3.listObjects({ Bucket: bucket, Prefix: `${circuit}` }).promise();

  const bucketData = list.Contents.filter(cont => cont.Key.match(`^${circuit}/.*\.zkey$`)).sort(
    (a, b) => new Date(b.LastModified) - new Date(a.LastModified),
  );

  if (! bucketData || ! bucketData[0]) {
    logger.warn({ msg: 'No lastest contribution found for circuit', circuit });
    return false;
  }

  return bucketData[0].Key.match(`^${circuit}/beacon.zkey$`) != null;
}