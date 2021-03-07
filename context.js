const { isWritable, redirect } = require('./_helpers')

/**
 * 全局应用上下文对象
 */
module.exports = {
  /**
   * 请求路径
   */
  get method() {
    return this.req.method
  },
  /**
   * 是否可写
   *
   * @type {Boolean}
   */
  get writable() {
    return isWritable(this.res)
  },
  /**
   * 重定向
   *
   * @param {String} location   重定向地址
   * @param {Number} [code=301] http 状态码
   *
   * @return {void}
   */
  redirect(location, code) {
    redirect(this.res, location, code)
  },
}
