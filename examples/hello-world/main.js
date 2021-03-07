const { createApp } = require('../../index')

const app = createApp()

app.use((ctx) => {
  ctx.body = 'hello,world'
})

app.listen(8080, function () {
  console.log('Liston on: http://127.0.0.1:8080')
})
