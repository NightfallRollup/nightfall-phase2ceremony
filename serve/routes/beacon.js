import express from 'express';
import {
  beaconAuth,
  hasFile,
  routeValidator,
} from '../services/validations.js';
import { applyBeaconContribution } from '../services/contribution.js';
import { uploadBeaconSchema } from '../schemas/upload.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/', beaconAuth, routeValidator.body(uploadBeaconSchema), hasFile, async (req, res) => {
  const { circuit, token } = req.body;
  const { data } = req.files.contribution;

  logger.info({ msg: 'Initiating beacon contribution', circuit });

  try {
    await applyBeaconContribution(req, token, circuit, data);
  } catch (error) {
    logger.warn(error.message);      
    res.status(400);
    return;
  }

  res.send({
    status: true,
    verification: res.locals,
  });
});

export default router;
