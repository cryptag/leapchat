const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const env = require('node-env-file');
const outputFolder = 'build';

env(__dirname + '/.env');

module.exports = {
  context: __dirname,
  output: {
    path: path.resolve(__dirname, outputFolder),
    filename: '[name].bundle.js'
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
    extensions: ['.js', '.jsx', '.css', '.scss'],
    modules: [
      'node_modules'
    ]
  },
  plugins: [
    new CleanWebpackPlugin([outputFolder]),
    new HtmlWebpackPlugin({
      title: 'Leapchat',
      template: './src/index-template.ejs'
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new webpack.EnvironmentPlugin({
      BACKEND_URL: process.env.BACKEND_URL,
    })
  ]
}