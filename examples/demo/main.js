const path = require('path')

const { Environment, FileSystemLoader } = require('nunjucks')

const { createApp } = require('../../index')
const assets = require('../../middlewares/assets')
const view = require('../../middlewares/view')

const router = require('./router')

const app = createApp()

app.use(assets(path.join(__dirname, 'public')))
app.use(
  view({
    viewEngine: new Environment(new FileSystemLoader(path.join(__dirname, 'views'))),
  }),
)

app.use(router.routes())

app.listen(8080, function () {
  console.log('Liston on: http://127.0.0.1:%s', 8080)
})
