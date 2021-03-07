/**
 * 视图渲染
 */
module.exports = function view(opt) {
  const viewEngine = opt.viewEngine

  return function Middleware(ctx, next) {
    ctx.render = function (filename, context) {
      this.type = 'text/html'
      this.status = 200
      this.body = viewEngine.render(filename, context)
    }

    return next()
  }
}
