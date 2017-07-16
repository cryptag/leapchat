const path = require('path')
const webpack = require('webpack')
const WebpackMd5Hash = require('webpack-md5-hash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = {
  entry: {
    vendor: './src/vendor.js',
    main: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build',
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.json', '.jsx']
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
    }),
    new WebpackMd5Hash(),
    new InlineManifestWebpackPlugin({
      name: "webpackManifest",
    }),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
    }),
    new ExtractTextPlugin('pack.[contenthash].css')
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['react', 'es2015']
        }
      }
    }]
  }
}

module.exports = [config]
