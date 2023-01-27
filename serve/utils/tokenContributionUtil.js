import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { isBeaconTheLatestContribution } from '../services/contribution.js'; 
import { CIRCUITS  } from './constants.js';

const tokenMutex = new Mutex();
const TOKEN_ATTR_NAME = 'CONTRIBUTION_TOKEN';

/**
 * Async function that issues a new token if there isn't a valid token in the run.
 * 
 * @returns 
 *  null - a token couldn't be generated because there is a valid one in the session
 *  object - an object containing info about token:
 *            { 
 *              token: string,          # the token value
 *              startingDate: date      # the date/time the token was created
 *              finishingDate: date     # the date/time the whole contribution process finished
 *              expirationDate: date    # the date/time the token expires
 *              circuits: array         # array that contains the circuits with contributions already processed
 *            }
 */
const issueNewToken = async (app) => {
  let newToken = null;

  const hasBeaconContribution = await isBeaconTheLatestContribution(CIRCUITS[0]);
  if (hasBeaconContribution) {
    throw new Error("Sorry, Nightfall Phase2 ceremony is done!");
  }

  await tokenMutex.runExclusive(async () => {
    const currentToken = app.get(TOKEN_ATTR_NAME);

    if(currentToken && ! isTokenExpired(currentToken)) {
      return;
    }

    const tokenValue = uuidv4();
    const tokenData = {
      token: tokenValue,
      startingDate: new Date(),
      finishingDate: null,
      expirationDate: getExpiringDate(process.env.TOTAL_EXPIRING_HOUR || 1),
      circuits: []
    };

    app.set(TOKEN_ATTR_NAME, tokenData);

    newToken = tokenData;
  });

  return newToken;
}

const isTokenExpired = token => {
  return token.expirationDate.getTime() < new Date().getTime();
}

/**
 * 
 */
const isTokenValid = (token, app) => {
  const currentToken = app.get(TOKEN_ATTR_NAME);

  return currentToken
          && currentToken.token === token
          && ! isTokenExpired(currentToken);
}

/**
 * Adds the lastest contribution regarding the circuit to the token 
 */
const updateCircuitInToken = async (app, circuit) => {
  await tokenMutex.runExclusive(async () => {
    const token = app.get(TOKEN_ATTR_NAME);

    token.circuits.push(circuit);

    logger.info({ msg: `Token updated`, token });

    app.set(TOKEN_ATTR_NAME, token);
  });
}

/**
 * Resets the current token as soon as possible all the contributions are sent, 
 * giving oportunity for others to contribute too.
 */
const resetTokenIfContributionIsDone = async (app) => {
  await tokenMutex.runExclusive(async () => {
    const token = app.get(TOKEN_ATTR_NAME);

    if(token.circuits.length == CIRCUITS.length) {
      token.finishingDate = new Date();
      logger.info({ msg: 'Reseting token, contribution is done!', token });

      app.set(TOKEN_ATTR_NAME, null);
    }
  });
}

const getExpiringDate = totalHours => {
  return new Date(new Date().getTime() + totalHours * 60 * 60 * 1000);
}

export { issueNewToken, isTokenValid, updateCircuitInToken, resetTokenIfContributionIsDone };
