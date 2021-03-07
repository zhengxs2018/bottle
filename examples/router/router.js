const { createRouter } = require('../../index')

const router = createRouter()

router.addRoute('/', async (ctx) => {
  ctx.body = 'hello,world'
})

router.addRoute('/login', 'POST', async (ctx) => {
  ctx.body = {
    code: 200,
    message: '用户登录成功',
  }
})

module.exports = router
