# @zhengxs/bottle

这是一个学习型的项目，你可以通过阅读文档和源码，最终学会如何写一个 web 框架。

## 安装

```bash
$ npm i @zhengxs/bottle -S
```

## 示例

```javascript
const { createApp } = require('@zhengxs/bottle')

const app = createApp()

app.use((ctx) => {
  ctx.body = 'hello,world'
})

app.listen(8080, function () {
  console.log('Liston on: http://127.0.0.1:8080')
})
```

[学习教程](./docs/README.md)

## License

- MIT
