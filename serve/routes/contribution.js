import express from 'express';
import { hasFile, routeValidator, validateContribution } from '../services/validations.js';
import { uploadContribSchema } from '../schemas/upload.js';
import { upload } from '../services/upload.js';
import { getLatestContribution } from '../services/latestContrib.js';
import logger from '../utils/logger.js';
import { isTokenValid, updateCircuitInToken, resetTokenIfContributionIsDone } from '../utils/tokenContributionUtil.js';

const router = express.Router();

router.get('/:circuit', async (req, res, next) => {
  try {
    // validate the circuit value
    const { circuit } = req.params;

    const contrib = await getLatestContribution({ circuit });
    return res.status(200).send(contrib.Body);
  } catch (err) {
    next(err);
  }
});

router.post('/', routeValidator.body(uploadContribSchema), hasFile, async (req, res, next) => {
  try {
    // validate the circuit value
    const { name, circuit, token } = req.body;
    const { data } = req.files.contribution;

    if(! isTokenValid(token, req.app)) {
      logger.warn(`Invalid token: ${token}`);
      res.status(400).send('Sorry, your contribution session expired or the token is not valid. Please, try again later!');
      return;
    }

    /* Changes the name to be in the format `${name_YYYY-MM-DD} so that if the same "name" does many
     * contributions, the previous does not get overwritten.
     */
    const newName = `${name}_${new Date().toISOString()}`;

    //send response immediately so the user can start working on the next circuit
    res.send({
      status: true,
      verification: res.locals,
    });

    logger.info({
      msg: 'Verifying contribution...',
      circuit,
      name: newName
    });

    // THEN verify it before uploading. The verification logs are unused for now :(
    const vl = await validateContribution({ circuit, contribData: data });

    logger.info({
      msg: 'Contribution verified!',
      circuit,
      name: newName
    });

    // Upload it
    await upload({ circuit, name: newName, data: data });

    updateCircuitInToken(req.app, circuit);

    resetTokenIfContributionIsDone(req.app);
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

export default router;
