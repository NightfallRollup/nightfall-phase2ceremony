import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

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
 *              expirationDate: date    # the date/time the token expires
 *            }
 */
const issueNewToken = async (app) => {
  let newToken;
  await tokenMutex.runExclusive(async () => {
    const currentToken = app.get(TOKEN_ATTR_NAME);

    if(currentToken && currentToken.expirationDate.getTime() >= new Date().getTime()) {
      newToken = null;
      return;
    }

    const tokenValue = uuidv4();
    const tokenData = {
      token: tokenValue,
      expirationDate: getExpiringDate(process.env.TOTAL_EXPIRING_HOUR || 1),
      circuits: []
    };

    app.set(TOKEN_ATTR_NAME, tokenData);

    newToken = tokenData;
  });

  return newToken;
}

/**
 * 
 */
const isTokenValid = (token, app) => {
  const currentToken = app.get(TOKEN_ATTR_NAME);

  return currentToken
          && currentToken.token === token
          && currentToken.expirationDate.getTime() >= new Date().getTime();
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

    if(token.circuits.length == 6) { // TODO replace with the array's length of circuits constant!
      logger.info({ msg: 'Reseting token, contribution is done!', token });

      app.set(TOKEN_ATTR_NAME, null);
    }
  });
}

const getExpiringDate = (totalHours) => {
  return new Date(new Date().getTime() + totalHours * 60 * 60 * 1000);
}

export { issueNewToken, isTokenValid, updateCircuitInToken, resetTokenIfContributionIsDone };
