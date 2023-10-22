import Pino from 'pino';

export default Pino({
  level: 'info',
  timestamp: Pino.stdTimeFunctions.isoTime,
});
