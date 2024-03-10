export default function throttle(
  _function,
  config = { limit: 58, interval: 62 * 1000 }
) {
  let currentRoundStartTime = 0;
  let activeCount = 0;
  let limit = config.limit;
  let roundDuration = config.interval;
  const queue = new Map();

  const getDelay = () => {
    const now = Date.now();
    if (now - currentRoundStartTime > roundDuration) {
      currentRoundStartTime = now;
      activeCount = 1;
      return 0;
    }

    if (activeCount < limit) {
      activeCount++;
    } else {
      currentRoundStartTime += roundDuration;
      activeCount = 1;
    }

    return currentRoundStartTime - now;
  };

  return (..._arguments) => {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const execute = () => {
        resolve(_function.apply(this, _arguments));
        queue.delete(timeoutId);
      };
      const delay = getDelay();
      if (delay > 0) {
        timeoutId = setTimeout(execute, delay);
        queue.set(timeoutId, reject);
      } else {
        execute();
      }
    });
  };
}
