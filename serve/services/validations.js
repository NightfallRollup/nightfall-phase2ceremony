import { createValidator } from 'express-joi-validation';
import { zKey } from 'snarkjs';
import logger from '../utils/logger.js';

export const routeValidator = createValidator();
export async function beaconAuth(req, res, next) {
  const token = req.headers['x-app-token'];
  if (token && process.env.AUTH_KEY && token === process.env.AUTH_KEY) return next();
  return res.status(401).send('Unauthorized');
}

export async function hasFile(req, res, next) {
  if (!req.files) {
    return res.status(400).send({
      status: false,
      message: 'No file uploaded',
    });
  }
  next();
}

export async function validateContribution({ circuit, contribData }) {
  return await zKey.verifyFromR1cs(
    { type: 'file', fileName: `../circuits/${circuit}.r1cs` },
    { type: 'file', fileName: `../circuits/phase1.ptau` },
    contribData,
    logger
  );
}
