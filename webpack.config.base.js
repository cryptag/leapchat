const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const env = require('node-env-file');
const outputFolder = 'build';

const emoji = require('./src/constants/emoji');

env(__dirname + '/.env');

module.exports = {
  context: __dirname,
  output: {
    path: path.resolve(__dirname, outputFolder),
    filename: '[name]_[chunkhash].bundle.js'
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
        loader: 'file-loader?name=[name].[ext]'
      },
      {
        test: /\.wav$/,
        loader: 'file-loader?name=[name].[ext]'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json'],
    modules: [
      'node_modules'
    ]
  },
  plugins: [
    new CleanWebpackPlugin([outputFolder]),
    new HtmlWebpackPlugin({
      title: 'LeapChat',
      template: './src/index-template.ejs'
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new CopyWebpackPlugin([
      {
        from: 'node_modules/emoji-datasource-apple/img/apple/64',
        to: emoji.EMOJI_APPLE_64_PATH
      },
      {
        from: 'node_modules/emoji-datasource-apple/img/apple/sheets/64.png',
        to: emoji.EMOJI_APPLE_64_SHEET
      },
    ])
  ]
}
