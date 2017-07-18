const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('./webpack.config.dev')
const compiler = webpack(webpackConfig)
const app = express()

app.set('etag', false)

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: { colors: true }
}))

app.use(webpackHotMiddleware(compiler, {
  log: console.log
}))

app.listen(process.env.PORT || 8081, () => {
  console.log('Server running...')
})