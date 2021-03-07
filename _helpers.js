const assert = require('assert')
const { STATUS_CODES } = require('http')

const mime = require('mime-types')
const onFinished = require('on-finished')

const isFinished = onFinished.isFinished

/**
 * 判断是否为有效的状态码
 *
 * @param {Number} statusCode       状态码
 *
 * @throws {AssertionError}
 */
function assertStatusCode(statusCode) {
  // assert(Number.isInteger(statusCode), 'status code must be a number')
  assert(statusCode in STATUS_CODES, `invalid status code: ${statusCode}`)
}

/** 检查此类状态码是否为空内容
 *
 * @param {Number} [statusCode=204] 状态码
 *
 * @return {Boolean}
 */
function isNoContentStatusCode(statusCode) {
  return statusCode === 204 || statusCode === 205 || statusCode === 304
}

/**
 * 是否可写
 *
 * @param {import('http').ServerResponse} res
 *
 * @return {Boolean}
 */
function isWritable(res) {
  if (res.writableEnded || isFinished(res)) return false

  const socket = res.socket
  // There are already pending outgoing res, but still writable
  // https://github.com/nodejs/node/blob/v4.4.7/lib/_http_server.js#L486
  return !socket || socket.writable
}

/** 请求重定向
 *
 * @private
 *
 * @param {import('http').ServerResponse} res  重定向位置
 * @param {String} location   重定向地址
 * @param {Number} [code=301] http 状态码
 *
 * @return {void}
 */
function redirect(res, location, code) {
  const statusCode = code || 301

  res.statusCode = statusCode
  res.statusMessage = `Redirect ${statusCode}`

  res.setHeader('Location', location)
  res.end()
}

/**
 * 设置上下文类型
 *
 * @param {Object } ctx        请求上下文
 * @param {String} defaultType 默认类型
 */
function setDefaultContentType(ctx, defaultType) {
  const res = ctx.res

  if (res.hasHeader('Content-Type') !== true) {
    // 获取 content-type 的值
    res.setHeader('Content-Type', mime.lookup(ctx.type) || ctx.type || defaultType)
  }
}

module.exports = {
  isWritable,
  isFinished,
  assertStatusCode,
  isNoContentStatusCode,
  setDefaultContentType,
  redirect,
}
