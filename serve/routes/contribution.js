import express from 'express';
import { hasFile, routeValidator } from '../services/validations.js';
import { uploadContribSchema } from '../schemas/upload.js';
import { getLatestContribution } from '../services/latestContrib.js';
import { applyUserContribution } from '../services/contribution.js';
import logger from '../utils/logger.js';
import { isTokenValid, resetTokenIfContributionIsDone } from '../utils/tokenContributionUtil.js';
import { CIRCUITS  } from '../utils/constants.js';

const router = express.Router();

router.get('/:circuit', async (req, res, next) => {
  try {
    // Validate the circuit value
    const { circuit } = req.params;
    const { token } = req.query;

    if(! await isTokenValid(token, req.app)) {
      logger.warn(`Invalid token: ${token}`);
      res.status(400).send('Sorry, your contribution session expired or the token is not valid. Please, try again later!');
      return;
    }

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
    // Validate the circuit value
    const { name, circuit, token } = req.body;
    const { data } = req.files.contribution;

    try {
      await applyUserContribution(req, token, circuit, name, data);
    } catch (error) {
      logger.warn(error.message);      
      res.status(400);
      return;
    }

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
