const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const env = require('node-env-file');
const outputFolder = 'build';

const emoji = require('./src/constants/emoji');

env(__dirname + '/.env');

module.exports = {
  context: __dirname,
  output: {
    path: path.resolve(__dirname, outputFolder),
    filename: '[name]_[chunkhash].bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          'name': '[name].[ext]'
        }
      },
      {
        test: /\.wav$/,
        loader: 'file-loader',
        options: {
          'name': '[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json'],
    modules: [
      'node_modules'
    ],
    fallback: {
      "crypto": require.resolve('crypto-browserify'),
      "stream": require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'LeapChat',
      template: './src/index-template.ejs'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin([
      {
        from: 'node_modules/emoji-datasource-apple/img/apple/64',
        to: emoji.EMOJI_APPLE_64_PATH
      },
      {
        from: 'node_modules/emoji-datasource-apple/img/apple/sheets/64.png',
        to: emoji.EMOJI_APPLE_64_SHEET
      },
      {
        from: 'src/static/js/emoji-fixed.js',
        to: '../node_modules/emoji-js/lib/emoji.js'
      }
    ]),
  ]
}
