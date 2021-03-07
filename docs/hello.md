# hello,world

任何人都是从最基础的知识中慢慢学上来的，就像有人说的，哪位大神没写过 "hello，world"。

今天我们就先从最简单的 "hello，world" 开始写起，逐步完善，最终形成属于我们自己的 web 框架。

## 一、搭建工程

> 注意：本篇内容，默认你的电脑已安装 `node >= 10`，并且已经配置完环境变量，后续不在进行提示。

### 1、创建目录

首页在电脑硬盘中，建立一个空白文件夹，打开命令行工具，执行如下命令：

```bash
# 根据提示输入内容
$ npm init
```

当命令执行完毕，你会看到目录下方多了一个 `package.json` 文件，当这个文件创建完毕，你的目录也就变成了一个 npm 包。

当然你也可以通过手动新建 `package.json` 文件，或者执行 `npm init -y` 跳过询问 ，直接创建。

此时你的目录大概是这样的：

```bash
你的目录/
└── package.json
```

### 2、创建 `demo/main.js` 文件

我们创建好了目录，这个目录就是我们以后发布的 npm 包目录，或者说是框架的源码目录。

为了开发方便，我们在框架目录，新建一个 `demo` 用于放置示例代码。

任何程序都需要入口，示例也一样，我们在示例目录下方建立一个入口文件，将入口文件命名为 `main.js`，当然你也可以使用其他名称。

此时你的目录结构是这样的：

```bash
你的目录/
├── demo/
|   └── main.js
└── package.json
```

## 二、写一个 `hello,world`

我们在 `demo/main.js` 写出如下代码，你可以选择黏贴，但推荐手动敲一遍，这样可以加深印象。

```javascript
// 这是 node 内置模块，不需要通过 npm 安装
const http = require('http')

// 创建一个 http 服务
// req 为请求对象，具体的请看官方文档：https://nodejs.org/api/http.html#http_class_http_incomingmessage
// res 为响应对象，具体的请看官方文档：https://nodejs.org/api/http.html#http_class_http_serverresponse
const server = http.createServer(function handleRequest(req, res) {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Document</title>
    </head>
    <body>
      <h1>hello,world</h1>
    </body>
  </html>
`

  // 设置响应头
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Length', Buffer.byteLength(html))

  // 响应内容
  // 注意：响应内容可以是任意的字符串，不需要特定格式
  res.end(html, 'utf8')
})

// 监听 8080 端口
server.listen(8080, function () {
  // 如果应用启动成功，这里就会执行
  console.log('Liston on: http://127.0.0.1:8080')
})
```

保存好代码后，打开命令行工具，执行如下命令：

```bash
$ node ./demo/main.js
```

如果你的命令没有写错，并且端口号没有被占用的情况下，那命令行应会输出这段话：

```bash
$ Liston on: http://127.0.0.1:8080
```

此时你的服务也就启动完成，你可以打开浏览器，输入 `http://127.0.0.1:8080` 就可以看到你的 `hello,world` 了。

但这时修改你的代码，网页刷新后，却依然是刚开始的内容。

这是因为 `nodejs` 没有热更新的功能，程序一旦加载，就会驻留到内存中，修改原始文件，程序并不会重新加载你的代码，所以也就无法看到修改后的内容。

如果希望修改后能自动加载新的代码，可以参考 [本地开发](./dev.md) 文章，这样修改后，刷新页面看到的就是新的内容。

## 三、处理多个请求

假设我们现在正在写一个 登录页 和 登录接口，页面渲染用的是 `GET` 请求，而接口用的是 `POST` 请求，并且登录的路径一般都是以 `/login` 命名的，那我们该如何处理呢？

### 1. 路径和方法识别

需要识别多个路径，这是就需要用到 `http.createServer` 传递进来的另一个参数。

`req` 是否个对象，有一个 `req.url` 属性，我们通过这个进行判断。

但这个属性除了包含路径外，还包含请求参数，也就是它的值可能是 `/login?a=1`。

所以我们无法通过字符串进行判断，如：

```javascript
const server = http.createServer((req, res) => {
  // 如果用户输入 http://127.0.0.1:8080/login?a=1
  // 那么 req.url 就是 /login?a=1
  if (req.url === '/login') {
    if (req.method === 'GET') {
      // 渲染网页
    } else if (req.method === 'POST') {
      // 响应数据
    }
  }
})
```

虽然我们可以使用其他字符串的操作进行处理，但最合适的方式是使用路由 ，可以通过阅读 [路由](./tutorials/routing.md) 章节了解一个路由是如何开发的。

这里我们暂不考虑参数的问题，我们重新组织下代码，就变化成了这个样子：

<details>
  <summary>查看代码</summary>

```javascript
// 这是 node 内置模块，不需要通过 npm 安装
const http = require('http')

function renderHomePage(req, res) {
  // 将前面的 hello,world 逻辑移动到这里来
}

function renderLoginPage(req, res) {
  // 类同
}

function renderNotfoundPage(req, res) {
  // 类同
}

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

// 创建一个 http 服务
const server = http.createServer(function handleRequest(req, res) {
  // 暂不考虑参数问题
  switch (req.url) {
    case '/':
      renderHomePage(req, res)
      break
    case '/login':
      if (req.method === 'GET') {
        renderLoginPage(req, res)
        break
      } else if (req.method === 'POST') {
        handleLogin(req, res)
        break
      }
    // 404
    default:
      renderNotfoundPage(req, res)
  }
})
```

</details>

### 2. 请求过程管理

虽然上一节效果是达到了，但都是直接就响应，真实情况下，在响应前需要进行一些逻辑处理，如：

1. 判断是否登录
   1. 未登录，直接响应 401，不在进行后续处理
   2. 已登录，继续流转
2. 判断用户角色
   1. 当前登录用户没有这个角色，直接响应 403 ，不在进行后续处理
   2. 当前登录用户拥有这个角色，继续流转

但这会有先后顺序，如果没有登录，那就不需要进行角色判断了，它们的先后顺序为：

```plan
判断是否登录 -> 判断用户角色 -> 最终处理函数（一般称呼为 controller）
```

**为什么会这样呢？**

是因为 web 程序允许多用户使用，如果不登录，web 程序就不知道该如何提供信息。

而不同的角色拥有不同的功能，如 **管理员** 这个角色可以进入后台系统，而 **普通用户** 却不行。

于是，我们的代码就改造成这样了：

<details>
  <summary>查看代码</summary>

```javascript
function assertLogin(req, res) {
  // 你的判断逻辑，如：判断 cookie 存不存在，不存在说明未登录
  if (xxx) {
    // 可以使用特殊的异常类
    // 推荐 http-errors 这个 npm 包
    const err = new Error('用户未登录')

    // 响应 401 状态码
    err.status = 401

    // 由异常拦截的函数进行后续处理
    throw err
  }
}

function assertIsAdmin(req, res) {
  // 你的判断逻辑
  if (xxx) {
    // 可以使用特殊的异常类
    // 推荐 http-errors 这个 npm 包
    const err = new Error('权限不足，请联系管理员处理')

    // 响应 403 状态码
    err.status = 403

    // 由异常拦截的函数进行后续处理
    throw err
  }
}

const server = http.createServer(function handleRequest(req, res) {
  // 暂不考虑参数问题
  switch (req.url) {
    case '/':
      // 判断是否登录
      assertLogin(req, res)

      // 渲染首页
      renderHomePage(req, res)
      break
    case '/admin ':
      // 判断是否登录
      assertLogin(req, res)

      // 判断是否管理员
      assertIsAdmin(req, res)

      // 渲染管理后台首页
      handleAdminPage(req, res)
      break
    default:
      renderNotfoundPage(req, res)
  }
})
```

</details>

用如上代码看似解决了问题，但我们需要明白，目前我们所有的调度逻辑都在一个函数里面，而且所有的操作都要求同步。

如果都是同步处理，那一个请求卡住之后，整个程序都会挂起，导致其他请求无法被正常处理。

为什么 nodejs 能异军突起，挤占了很大部分的服务端编程领域，就是因为异步的特性，可以同时处理多个请求。

如果是异步的，那么需要考虑当前功能无法处理，允许调用下一个继续操作，或者当前操作完，可以允许下一个继续操作。

这中种处理方式，就是 **中间件** 的处理方式。

可以通过研究 `koa` 的 [koa-compose][koa-compose] 的模块，了解 **中间件** 的运行机制。

在 nodejs 中，**express** 因为出现的较早，并且知名程度高，其设计的 api 成为事实上的标准，后面很多的框架，都是参考它的 api。

但随着 `promise` 的普及，加上 `async/await` 的标准化完成，像 [koa][koa] 就大胆的采用 `async/await` 开发中间件。

## 四、静态资源和视图

静态资源指的是引用不会基于运行时行为进行重新计算的行为，通常指 css，js 和图片等，因为这些内容一旦上传，不会存在程序运行时修改文件的内容。

视图指的 html 内容，通常也被认为是静态资源，但 html 存在动态渲染的情况，如果需要动态渲染，通常采用模板引擎处理。

这里需要用到 2 个内置的模块，一个是 `path` 模块 ，用于处理文件路径，一个是 `fs` 模块，用于文件 内容。

### 1、 发送 html 文件

我们在 `demo` 下面建立一个 `views` 目录，并且添加一个 `index.html` 文件。

此时你的目录结构是这样的：

```bash
你的目录/
├── demo/
|   ├── views/
|   |  └── index.html
|   └── main.js
└── package.json
```

我们将最开始的 `hello,world` 内容转移到 `index.html` 中，然后编写渲染函数。

<details>
  <summary>查看代码</summary>

```javascript
const path = require('path')
const fs = require('fs')

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

const server = http.createServer(function handleRequest(req, res) {
  switch (req.url) {
    case '/':
      // 判断是否登录
      assertLogin(req, res)

      // 渲染首页
      render(res, 'index.html')
      break
    case '/admin ':
      // 判断是否登录
      assertLogin(req, res)

      // 判断是否管理员
      assertIsAdmin(req, res)

      // 渲染管理后台首页
      render(res, 'admin/index.html')
      break
    default:
      renderNotfoundPage(req, res)
  }
})
```

</details>

我们重启程序后，在浏览器地址栏中输入 `http://127.0.0.1:8080`，就可以看到内容了。

### 2、 发送静态资源

我们在 `demo` 下面建立一个 `public` 目录，并且添加一个 `reset.css` 文件。

此时你的目录结构是这样的：

```bash
你的目录/
├── demo/
|   ├── public/
|   |  └── reset.css
|   ├── views/
|   |  └── index.html
|   └── main.js
└── package.json
```

`reset.css` 文件我们随便写点，如：

```css
body {
  color: red;
}
```

然后在 `index.html` 中的 `head` 添加一行代码：

```html
<link rel="stylesheet" href="/reset.css" />
```

我们将最开始的 `hello,world` 内容转移到 `index.html` 中，然后编写静态资源函数。

<details>
  <summary>查看代码</summary>

```javascript
// 静态资源根目录
// __dirname 是 nodejs 特殊的变量，代表当前文件所在目录
const publicDir = path.join(__dirname, 'public')

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

const server = http.createServer(function handleRequest(req, res) {
  // 静态资源有点特殊
  // 因为是根据文件地址来的，而且文件可能很多，没办法固定判断
  // 所以任何请求都需要在最前面进行判断
  if (assets(req, res)) {
    return
  }

  switch (req.url) {
    case '/':
      // 判断是否登录
      assertLogin(req, res)

      // 渲染首页
      render(res, 'index.html')
      break
    case '/admin ':
      // 判断是否登录
      assertLogin(req, res)

      // 判断是否管理员
      assertIsAdmin(req, res)

      // 渲染管理后台首页
      render(res, 'admin/index.html')
    default:
      renderNotfoundPage(req, res)
  }
})
```

</details>

我们重启程序后，在浏览器地址栏中输入 `http://127.0.0.1:8080`，就可以页面的文字已经变成红色的了。

## 结束

至此，我们从一个最开始只有 `hello,world`，的代码，完成了一个 web 应用的基础功能开发。

通过这章内容的阅读，对我们理解下一章的框架开发会更加深刻。

在进行框架开发的时候，也将更加了解到每一行代码的含义和可优化的方向，同时在选择生产项目的框架的时候，也更加明白我们需要应该是一个什么样的功能。

**\[完整代码\]（稍后上传）**

[koa]: https://koajs.com/
[koa-compose]: https://github.com/koajs/compose
