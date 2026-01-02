const NodeCache = require("node-cache");

const cache = new NodeCache();

function clearAllCache() {
  cache.flushAll();
}

module.exports = {
  cache,
  clearAllCache,
};
