const compose = require('koa-compose')
const { match } = require('path-to-regexp')

/**
 * 创建路由
 */
function createRouter() {
  const rules = []

  /**
   * 注册路由
   *
   * @param {String} path 路径
   * @param {String|Function} method http 请求方法
   * @param {...Function} callbacks 中间件
   */
  function addRoute(path, method, ...callbacks) {
    if (typeof method === 'function') {
      callbacks.unshift(method)
      method = 'GET'
    }

    rules.push({
      match: match(path, { sensitive: true }),
      method: method,
      handle: compose(callbacks),
    })
  }

  /**
   * @private
   *
   * @param {import('http').IncomingMessage} req
   */
  function matchRoute(ctx) {
    const path = ctx.path
    const method = ctx.method

    for (const rule of rules) {
      if (method === rule.method) {
        const params = rule.match(path)
        if (params) {
          return { params, handle: rule.handle }
        }
      }
    }
  }

  /**
   * 路由中间件
   */
  function routes() {
    return async function (ctx, next) {
      const route = matchRoute(ctx)
      if (route) {
        ctx.params = route.params
        return route.handle(ctx, next)
      }
      return next()
    }
  }

  return {
    addRoute,
    routes,
  }
}

module.exports = {
  createRouter,
}
