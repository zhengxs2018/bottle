const http = require('http')
const assert = require('assert')
const { format } = require('util')
const { Stream } = require('stream')

const compose = require('koa-compose')
const onFinished = require('on-finished')

const {
  isWritable,
  assertStatusCode,
  isNoContentStatusCode,
  setDefaultContentType,
} = require('./_helpers')
const { isNil } = require('./_util')

const { STATUS_CODES } = http

/**
 * 创建应用
 *
 * @param {import('http').ServerOptions} [options]
 *
 * @example
 *
 *  const app = createApp()
 *
 *  app.use(async ctx => {
 *    ctx.body = 'hello,world'
 *  })
 *
 *  app.listen(8080, function() {
 *     console.log('Liston on: http://127.0.0.1:8080')
 *  })
 */
function createApp(options) {
  /** 应用上下文 */
  const context = Object.create(require('./context'))

  /**
   * 中间件列表
   *
   * @private
   * @type {Function[]}
   */
  const middlewares = []

  /**
   * 添加中间件
   *
   * @param  {Function} fn
   *
   * @return {void}
   *
   * @example
   *
   * app.use(async ctx => {
   *   // 响应内容
   *   ctx.body = 'hello,world'
   * })
   */
  function use(fn) {
    assert(typeof fn === 'function', 'middleware must be a function!')
    middlewares.push(fn)
  }

  /**
   * 处理请求
   *
   * @private
   * @param {Object} ctx     请求上下文
   * @param {Function} fnMiddleware 中间件
   *
   * @return {Promise<void>}
   */
  function handleRequest(ctx, fnMiddleware) {
    const res = ctx.res

    // 设置默认状态
    res.statusCode = 404

    // 当出现错误的时候
    const handleError = (err) => errorHandler(ctx, err)

    // 响应内容
    const handleResponse = () => makeResponse(ctx)

    // 防止流数据没有自动关闭
    onFinished(res, handleError)

    return fnMiddleware(ctx).then(handleResponse).catch(handleError)
  }

  /**
   * 创建请求上下文
   *
   * @private
   * @param {import('http').IncomingMessage} req 请求对象
   * @param {import('http').ServerResponse} res 响应对象
   *
   * @return {Object} 请求上下文
   */
  function createContext(req, res) {
    // 继承应用上下文
    const ctx = Object.create(context)

    // 解析请求地址
    const url = new URL(req.url, 'file://')

    // 请求路径
    ctx.path = url.pathname

    // 请求对象
    ctx.req = req

    // 响应对象
    ctx.res = res

    // 上下文状态
    ctx.state = {}

    return ctx
  }

  /**
   * 回调函数
   */
  function callback() {
    // 组合中间件
    const fn = compose(middlewares)

    /**
     * 监听请求变化
     *
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} res
     *
     * @return {Promise<void>}
     */
    function requestListener(req, res) {
      const ctx = createContext(req, res)
      return handleRequest(ctx, fn)
    }

    return requestListener
  }

  /**
   * 监听端口
   *
   * @param  {...any} args
   * @return {import('http').Server}
   */
  function listen(...args) {
    return http.createServer(options, callback()).listen(...args)
  }

  return {
    context,
    use,
    callback,
    listen,
  }
}

/**
 * 创建响应
 *
 * @param {Object} ctx
 *
 * @return {void}
 */
function makeResponse(ctx) {
  const res = ctx.res
  if (!isWritable(res)) return

  // 获取响应内容
  const data = ctx.body

  // 获取状态码
  const code = ctx.statusCode || ctx.status || (isNil(data) ? 404 : 200)

  // 验证是否为有效的 http 状态码
  assertStatusCode(code)

  // 是否空内容状态码
  if (isNoContentStatusCode(code)) {
    return makeEmptyResponse(res)
  }

  // 设置状态码
  res.statusCode = code

  // 跳过 head 请求
  if ('HEAD' === ctx.method) {
    return res.end()
  }

  // 空内容
  if (isNil(data)) {
    const message = STATUS_CODES[code] || String(code)

    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/plan')
      res.setHeader('Content-Length', Buffer.byteLength(message))
    }

    return res.end(message)
  }

  // 如果是字符串的内容
  if (typeof data === 'string') {
    if (!res.headersSent) {
      setDefaultContentType(ctx, 'text/plan')
      res.setHeader('Content-Length', Buffer.byteLength(data))
    }

    return res.end(data, 'utf8')
  }

  if (Buffer.isBuffer(data)) {
    if (!res.headersSent) {
      if (res.hasHeader('Content-Type') !== true) {
        res.setHeader('Content-Type', 'application/octet-stream')
      }
      res.setHeader('Content-Length', data.length)
    }

    return res.end(data)
  }

  if (data instanceof Stream) {
    if (!res.headersSent) {
      setDefaultContentType(ctx, 'application/octet-stream')
      res.removeHeader('Content-Length')
    }
    data.pipe(res)
    return
  }

  const body = JSON.stringify(data)
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json')
  }

  res.end(body, 'utf8')
}

/**
 * 创建空响应
 *
 * @param {import('http').ServerResponse} res
 * @param {Number} [statusCode=204] 状态码
 *
 * @return {void}
 */
function makeEmptyResponse(res, statusCode) {
  res.statusCode = statusCode || 204

  res.removeHeader('Content-Type')
  res.removeHeader('Content-Length')
  res.removeHeader('Transfer-Encoding')

  res.end()
}

/**
 * 错误处理
 *
 * @param {Object} ctx 请求上下文
 * @param {Error} err  错误对象
 *
 * @return {void}
 */
function errorHandler(ctx, err) {
  const res = ctx.res
  // 如果已经响应就退出
  if (!isWritable(res)) return

  let message = null
  if (process.env.NODE_ENV === 'development') {
    message = err instanceof Error ? err.stack : format('non-error thrown: %j', err)
  }

  if (!message) {
    message = STATUS_CODES['500'] || 'server error'
  }

  // 如果请求头未发送，就设置
  if (!res.headersSent) {
    if (res.hasHeader('Content-Type') !== true) {
      res.setHeader('Content-Type', ctx.type || 'text/plan')
    }
    res.setHeader('Content-Length', Buffer.byteLength(message))
  }

  res.statusCode = err.status || 500
  res.end(message, 'utf8')
}

module.exports = {
  createApp,
}
