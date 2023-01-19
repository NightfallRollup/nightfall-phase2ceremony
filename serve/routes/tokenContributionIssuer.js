import express from 'express';
import { issueNewToken } from '../utils/tokenContributionUtil.js'
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const newToken = await issueNewToken(req.app);

  if(! newToken) {
    logger.warn('A user is trying to start a contribution while there is one in progress!');

    res.sendStatus(200);
    return;
  }

  logger.info({ msg: 'New contribution token generated', newToken });

  res.json({
    token: newToken.token
  });
});


export default router;