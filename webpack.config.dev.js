const config = require('./webpack.config.base');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

config.entry = './src';

config.mode = "development";

config.watch = true;

config.watchOptions = {
  aggregateTimeout: 300,
  poll: 1000
};

config.module.rules = [
  ...config.module.rules,
  {
    test: /\.css$/i,
    use: [MiniCssExtractPlugin.loader, "css-loader"],
  },
  {
    test: /\.s[ac]ss$/i,
    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
  }
];

config.devtool = 'source-map';

module.exports = config;