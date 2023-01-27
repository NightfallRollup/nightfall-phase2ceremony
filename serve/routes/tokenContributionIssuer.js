import express from 'express';
import { issueNewToken } from '../utils/tokenContributionUtil.js'
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let newToken;
  try {
    newToken = await issueNewToken(req.app);
  } catch (err) {
    logger.error(err.message);
    return res.status(503).send(err.message);
  }

  if(! newToken) {
    logger.warn('A user is trying to start a contribution while there is one in progress!');

    res.json({});
  } else {
    logger.info({ msg: 'New contribution token generated', newToken });

    res.json({
      token: newToken.token
    });
  }
});

export default router;