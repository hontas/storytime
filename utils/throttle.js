const throttle = (fn, wait = 300) => {
  let lastInvocation;
  return (...args) => {
    const now = Date.now()
    if (!lastInvocation || (now - lastInvocation) > wait) {
      fn(...args);
      lastInvocation = now;
    }
  };
}

module.exports = throttle;
