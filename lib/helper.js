/**
 * usage: const func = asyncHandler(async (req, res) => {});
 * @param {async function} fn
 * @returns
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = {
  asyncHandler,
};
