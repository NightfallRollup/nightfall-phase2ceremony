import express from 'express';
import {
  beaconAuth,
  hasFile,
  routeValidator,
  validateContribution,
} from '../services/validations.js';
import { uploadBeaconSchema } from '../schemas/upload.js';
import { upload } from '../services/upload.js';

const router = express.Router();

// TODO why is this beaconAuth needed?
router.post('/', beaconAuth, routeValidator.body(uploadBeaconSchema), hasFile, async (req, res) => {
  const { circuit, token } = req.body;
  const { data } = req.files.contribution;

  if(! isTokenValid(token, req.app)) {
    logger.warn(`Invalid token: ${token}`);
    res.status(400).send('Sorry, your contribution session expired or the token is not valid. Please, try again later!');
    return;
  }

  // THEN verify it before uploading. 
  const isContributionValid = await validateContribution({ circuit, contribData: data });
  if (! isContributionValid) {
    logger.warn({ msg: 'Contribution is not valid for circuit', circuit });
    res.status(400).send(`Contribution is not valid for circuit: ${circuit}`);
    return;
  }

  // Upload it
  await upload({ circuit, data: data, beacon: true });

  res.send({
    status: true,
    verification: res.locals,
  });
});

export default router;
