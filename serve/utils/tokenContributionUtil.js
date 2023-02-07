import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { isBeaconTheLatestContribution } from '../services/contribution.js'; 
import { CIRCUITS  } from './constants.js';
import memjs from 'memjs';

const tokenMutex = new Mutex();
const TOKEN_ATTR_NAME = 'CONTRIBUTION_TOKEN';

const createClient = () => {
  if(! process.env.MEMCACHIER_SERVERS) {
    logger.info("No memcached env var set");
    return;
  }

  logger.info(`Memcached: ${process.env.MEMCACHIER_SERVERS}`);

  return memjs.Client.create();
}
const memcachedClient = createClient();

const getToken = async (app) => {
  if(memcachedClient) {
    const result = await memcachedClient.get(TOKEN_ATTR_NAME);
    return result.value ? JSON.parse(result.value) : null;
  }

  return app.get(TOKEN_ATTR_NAME);
}

const setToken = async (app, tokenValue) => {
  if(memcachedClient) {
    return await memcachedClient.set(TOKEN_ATTR_NAME, JSON.stringify(tokenValue), {expires: process.env.TOTAL_EXPIRING_HOUR * 60 * 60 || 3600});
  }

  return app.set(TOKEN_ATTR_NAME, tokenValue);
}

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
    const currentToken = await getToken(app);

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

    await setToken(app, tokenData);

    newToken = tokenData;
  });

  return newToken;
}

const isTokenExpired = token => {
  return new Date(token.expirationDate).getTime() < new Date().getTime();
}

/**
 * 
 */
const isTokenValid = async (token, app) => {
  const currentToken = await getToken(app);

  return currentToken
          && currentToken.token === token
          && ! isTokenExpired(currentToken);
}

/**
 * Adds the lastest contribution regarding the circuit to the token 
 */
const updateCircuitInToken = async (app, circuit) => {
  await tokenMutex.runExclusive(async () => {
    const token = await getToken(app);

    token.circuits.push(circuit);

    logger.info({ msg: `Token updated`, token });

    await setToken(app, token);
  });
}

/**
 * Resets the current token as soon as possible all the contributions are sent, 
 * giving oportunity for others to contribute too.
 */
const resetTokenIfContributionIsDone = async (app) => {
  await tokenMutex.runExclusive(async () => {
    const token = await getToken(app);

    if(token.circuits.length == CIRCUITS.length) {
      token.finishingDate = new Date();
      logger.info({ msg: 'Reseting token, contribution is done!', token });

      await setToken(app, null);
    }
  });
}

const getExpiringDate = totalHours => {
  return new Date(new Date().getTime() + totalHours * 60 * 60 * 1000);
}

export { issueNewToken, isTokenValid, updateCircuitInToken, resetTokenIfContributionIsDone };
