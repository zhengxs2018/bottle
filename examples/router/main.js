const { createApp } = require('../../index')

const router = require('./router')

const app = createApp()

app.use(router.routes())

app.listen(8080, function () {
  console.log('Liston on: http://127.0.0.1:8080')
})
