import express from 'express';
import { hasFile, routeValidator, validateContribution } from '../services/validations.js';
import { uploadContribSchema } from '../schemas/upload.js';
import { upload } from '../services/upload.js';
import { getLatestContribution } from '../services/latestContrib.js';
import logger from '../utils/logger.js';
import { isTokenValid, updateCircuitInToken, resetTokenIfContributionIsDone } from '../utils/tokenContributionUtil.js';
import { CIRCUITS  } from '../utils/constants.js';

import fs from 'fs';

const router = express.Router();

router.get('/:circuit', async (req, res, next) => {
  try {
    // validate the circuit value
    const { circuit } = req.params;

    if (! CIRCUITS.includes(circuit)) {
      res.status(400).send('Invalid circuit!');
      return;
    }

    const contrib = await getLatestContribution({ circuit });
    if(! contrib) {
      res.sendStatus(404);
    } else {
      res.status(200).send(contrib.Body);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/', routeValidator.body(uploadContribSchema), hasFile, async (req, res, next) => {
  try {
    // validate the circuit value
    const { name, circuit, token } = req.body;
    const { data } = req.files.contribution;

    if (! CIRCUITS.includes(circuit)) {
      logger.warn(`Invalid circuit: ${circuit}`);
      res.status(400).send('Invalid circuit!');
      return;
    }

    if(! isTokenValid(token, req.app)) {
      logger.warn(`Invalid token: ${token}`);
      res.status(400).send('Sorry, your contribution session expired or the token is not valid. Please, try again later!');
      return;
    }

    fs.writeFile('/home/israel/work/phase2ceremony/deposit_contrib_tmp.zkey', data, error => {
      if(error)
        logger.error(error);
    });

    /* Changes the name to be in the format `${name_yyyy-mm-ddThh:MM:SS.mmmZ} so that if the same "name" does many
     * contributions, the previous does not get overwritten.
     */
    const newName = `${name}_${new Date().toISOString()}`;

    logger.info({
      msg: 'Verifying contribution...',
      circuit,
      name: newName
    });

    // THEN verify it before uploading
    const isContributionValid = await validateContribution({ circuit, contribData: data });
    if (! isContributionValid) {
      logger.error({ msg: 'Contribution is not valid for circuit', circuit });
      res.status(400).send(`Contribution is not valid for circuit: ${circuit}`);
      // TODO should we invalidate the token????
      // TODO send a msg?
      return;
    }

    logger.info({
      msg: 'Contribution verified!',
      circuit,
      name: newName
    });

    // Upload it
    await upload({ circuit, name: newName, data: data });

    updateCircuitInToken(req.app, circuit);

    resetTokenIfContributionIsDone(req.app);

    res.send({
      status: true,
      verification: res.locals,
    });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

export default router;
