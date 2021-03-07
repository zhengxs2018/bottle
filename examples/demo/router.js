const { createRouter } = require('../../index')

const router = createRouter()

router.addRoute('/', async (ctx) => {
  ctx.render('index.html', {
    name: 'node.js',
  })
})

router.addRoute('/about', async (ctx) => {
  ctx.render('about.html')
})

module.exports = router
