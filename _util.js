const { format } = require('util')

/**
 * 是否为 null 或 undefined
 *
 * @param {any} value
 *
 * @return {Boolean}
 */
function isNil(value) {
  return value === null || value === undefined
}

/**
 * 打印错误
 *
 * @private
 * @param {Error} err
 */
function printErrorMsg(err) {
  if (!(err instanceof Error)) {
    throw new TypeError(format('non-error thrown: %j', err))
  }

  const msg = err.stack || err.toString()
  console.error()
  console.error(msg.replace(/^/gm, '  '))
  console.error()
}

module.exports = {
  isNil,
  printErrorMsg,
}
