const fs = require('fs')
const path = require('path')
const http = require('http')

const { format } = require('util')

const { STATUS_CODES } = http

/**
 * 处理登录 post 请求
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function handleLogin(req, res) {
  // http 无法接收 json 对象，但支持字符串
  const data = JSON.stringify({
    code: 200,
    message: 'ok',
  })

  // 设置 Content-Type 让客户端插件可以处理
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Length', Buffer.byteLength(data))

  res.end(data, 'utf8')
}

// 视图根目录
// __dirname 是 nodejs 特殊的变量，代表当前文件所在目录
const viewDir = path.join(__dirname, 'views')

/**
 * 渲染 html 内容
 *
 * @param {import('http').ServerResponse} res 响应对象
 * @param {String} filename 文件位置
 */
function render(res, filename) {
  const filePath = path.join(viewDir, filename)

  try {
    // 判断文件是否可以访问
    fs.accessSync(filePath, 'r')

    // 读取文件，可以时情况缓存到内存中
    const file = fs.createReadStream(filePath)

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')

    res.once('error', () => {
      file.close() // 关闭文件
    })
    res.once('close', () => {
      file.close() // 关闭文件
    })

    // 传输数据
    file.pipe(res)
  } catch (err) {
    if (err.code) {
      // 排除文件不存在的情况
      if (['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'].includes(err.code)) {
        res.statusCode = 404
        res.end(`${filename} not found`)
        return
      }
    }
    res.statusCode = 500
    res.end(err.message)
  }
}

// 静态资源根目录
// __dirname 是 nodejs 特殊的变量，代表当前文件所在目录
const publicDir = path.join(__dirname, 'public')

/**
 * 静态资源，因为 static 是关键字，所以用了 assets
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function assets(req, res) {
  try {
    // 解析成 url 对象
    // URL 是 js 内置对象，低版本的浏览器和 nodejs 中不存在
    const location = new URL(req.url, 'file://')

    // 获取 url 路径
    const filename = location.pathname
    if (path.basename(filename) === '') {
      // 跳过没有后缀的
      return
    }

    // 拼接成文件地址
    const filePath = path.join(publicDir, location.pathname)

    // 判断文件是否可以访问
    fs.accessSync(filePath, 'r')

    // 读取文件
    const file = fs.createReadStream(filePath)

    res.statusCode = 200

    // 应该根据文件响应
    // 推荐使用 mime-types 这个 npm 模块进行处理
    // res.setHeader('Content-Type', 'text/plan')

    res.once('error', () => {
      file.close()
    })
    res.once('close', () => {
      // file.close()
    })

    // 传输数据
    file.pipe(res)

    // 告诉后面的，已经响应过了
    return true
  } catch (err) {
    if (err.code) {
      // 排除文件不存在的情况
      if (['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'].includes(err.code)) {
        // 由后续中间件进行处理
        return
      }
    }

    res.statusCode = 500
    res.end(err.message)

    // 告诉后面的，已经响应过了
    return true
  }
}

/**
 * 判断是否登录
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function assertLogin(req, res) {
  // 获取浏览器 cookie
  const cookie = req.headers['cookie'] || ''

  // 试试在浏览器的控制台执行 document.cookie = 'isLogin=1'
  if (cookie.indexOf('isLogin') === -1) {
    // 可以使用特殊的异常类
    // 推荐 http-errors 这个 npm 包
    const err = new Error('用户未登录')

    // 表示这个的错误消息是允许发送给客户的
    err.__http_error = true

    // 响应 401 状态码
    err.status = 401

    // 由异常拦截的函数进行后续处理
    throw err
  }
}

/**
 * 判断是否管理员
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function assertIsAdmin(req, res) {
  // 获取浏览器 cookie
  const cookie = req.headers['cookie'] || ''

  // 试试在浏览器的控制台执行 document.cookie = 'admin=1'
  if (cookie.indexOf('admin') === -1) {
    // 可以使用特殊的异常类
    // 推荐 http-errors 这个 npm 包
    const err = new Error('用户不存在管理员角色')

    // 表示这个的错误消息是允许发送给客户的
    err.__http_error = true

    // 响应 403 状态码
    err.status = 403

    // 由异常拦截的函数进行后续处理
    throw err
  }
}

const server = http.createServer(function handleRequest(req, res) {
  // 静态资源有点特殊
  // 因为是根据文件地址来的，而且文件可能很多，没办法固定判断
  // 所以任何请求都需要在最前面进行判断
  if (assets(req, res)) {
    return
  }

  try {
    switch (req.url) {
      case '/':
        // 渲染首页
        render(res, 'index.html')
        break
      case '/admin':
        // 判断是否登录
        assertLogin(req, res)

        // 判断是否管理员
        assertIsAdmin(req, res)

        // 渲染管理后台首页
        render(res, 'admin/index.html')
        break
      case '/login':
        if (req.method === 'GET') {
          // 渲染登录页
          render(res, 'login.html')
          break
        } else if (req.method === 'POST') {
          handleLogin(req, res)
          break
        }
      default:
        render(res, '404.html')
    }
  } catch (err) {
    // 如果是响应后出的错误就不在响应
    if (res.writableEnded || res.writableFinished || res.finished) {
      console.error(err)
      return
    }

    // 根据不通情况显示
    let message = null
    if (process.env.NODE_ENV === 'development') {
      message = err instanceof Error ? err.stack : format('non-error thrown: %j', err)
    } else if (err.__http_error) {
      message = err.message
    }

    if (!message) {
      message = STATUS_CODES['500'] || 'server error'
    }

    // 如果请求头未发送，就设置
    if (!res.headersSent) {
      if (res.hasHeader('Content-Type') !== true) {
        res.setHeader('Content-Type', 'text/plan;charset=utf-8')
      }
      res.setHeader('Content-Length', Buffer.byteLength(message))
    }

    res.statusCode = err.status || 500
    res.end(message, 'utf8')
  }
})

server.listen(8080, function () {
  console.log('Liston on: http://127.0.0.1:%s', 8080)
})
