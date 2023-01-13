import pino from 'pino';

const LOGGER_TIME_STRING = 'yyyy-mm-dd HH:MM:ss.l';

const getInstance = () => {
  const pinoOptions = {
    level: 'info',
    base: undefined,
    formatters: {
      // echoes the level as the label instead of the number
      level(label, number) {
        return { level: label };
      },
    },
    timestamp: () => `,"time": "${new Date(Date.now()).toISOString()}"`,
  };

  return pino(pinoOptions);
};

const instance = getInstance();

export default instance;
