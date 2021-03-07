const fs = require('fs')
const { basename, extname, sep, resolve } = require('path')
const util = require('util')

const mime = require('mime-types')

const stat = util.promisify(fs.stat)
const access = util.promisify(fs.access)

const NOTFOUND_CODES = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']

async function exists(filePath) {
  try {
    // 判断是否具有访问权限
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * 静态资源
 *
 * @param {String} root
 * @param {Object} [opts]
 * @param {Number} [opts.maxAge]
 */
function assets(root, opts = {}) {
  const maxAge = opts.maxAge || 0

  return async function (ctx, next) {
    const pathname = normalizePath(ctx.path)
    if (pathname === -1) {
      ctx.statusCode = 400
      ctx.body = 'failed to decode'
      return
    }

    try {
      const filePath = resolve(root, pathname)

      // 防止读取以 . 开头的路径
      if (isHidden(root, filePath)) {
        return next()
      }

      if (await exists(filePath)) {
        const stats = await stat(filePath)
        if (stats.isFile()) {
          /**
           * @type {import('http').ServerResponse}
           */
          const res = ctx.res

          res.setHeader('Content-Length', stats.size)
          res.setHeader('Last-Modified', stats.mtime.toUTCString())

          if (maxAge > 0) {
            res.setHeader('Cache-Control', `max-age=${(maxAge / 1000) | 0}`)
          }

          ctx.statusCode = 200
          ctx.type = mime.lookup(type(filePath, ''))
          ctx.body = fs.createReadStream(filePath)
        } else {
          return next()
        }
      } else {
        return next()
      }
    } catch (err) {
      if (NOTFOUND_CODES.includes(err.code)) {
        ctx.statusCode = 404
        ctx.body = err.message
      } else {
        ctx.statusCode = 500
        ctx.body = err.message
      }
    }
  }
}

function isHidden(root, path) {
  path = path.substr(root.length).split(sep)
  for (let i = 0; i < path.length; i++) {
    if (path[i][0] === '.') return true
  }
  return false
}

function normalizePath(path) {
  if (path.indexOf('/') === 0) {
    return decode(path.substr(0))
  }
  return decode(path)
}

function decode(path) {
  try {
    return decodeURIComponent(path)
  } catch (err) {
    return -1
  }
}

function type(file, ext) {
  return ext !== '' ? extname(basename(file, ext)) : extname(file)
}

module.exports = assets
